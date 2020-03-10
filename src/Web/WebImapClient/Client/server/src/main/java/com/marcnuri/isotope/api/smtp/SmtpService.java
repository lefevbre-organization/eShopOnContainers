/*
 * SmtpService.java
 *
 * Created on 2018-10-07, 18:25
 *
 * Copyright 2018 Marc Nuri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
package com.marcnuri.isotope.api.smtp;

import com.marcnuri.isotope.api.credentials.Credentials;
import com.marcnuri.isotope.api.exception.AuthenticationException;
import com.marcnuri.isotope.api.exception.IsotopeException;
import com.marcnuri.isotope.api.http.IsotopeURLDataSource;
import com.marcnuri.isotope.api.message.Attachment;
import com.marcnuri.isotope.api.message.Message;
import com.marcnuri.isotope.api.message.MessageUtils;
import com.sun.mail.util.MailSSLSocketFactory;
import com.sun.mail.imap.IMAPFolder;
import com.sun.mail.imap.IMAPStore;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.RequestScope;

import javax.activation.DataHandler;
import javax.activation.DataSource;
import javax.annotation.PreDestroy;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.Folder;
import javax.mail.Address;
import javax.mail.Flags;
import javax.mail.event.TransportEvent;
import javax.mail.event.TransportListener;
import javax.mail.internet.InternetHeaders;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import javax.mail.internet.MimeUtility;
import javax.mail.util.ByteArrayDataSource;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

import java.nio.charset.Charset;
import java.util.Arrays;
import java.util.List;
import java.util.Date;
import java.util.Properties;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static com.marcnuri.isotope.api.configuration.IsotopeApiConfiguration.DEFAULT_CONNECTION_TIMEOUT;
import static com.marcnuri.isotope.api.exception.AuthenticationException.Type.SMTP;
import static com.marcnuri.isotope.api.folder.FolderResource.REL_DOWNLOAD;
import static com.marcnuri.isotope.api.message.Message.HEADER_IN_REPLY_TO;
import static com.marcnuri.isotope.api.message.Message.HEADER_REFERENCES;


//import com.sun.mail.imap.protocol.RFC822DATA;
import com.sun.mail.imap.protocol.IMAPProtocol;
//import com.sun.mail.imap.IMAPFolder.ProtocolCommand;
//import com.sun.mail.imap.protocol.FetchResponse;
//import java.net.ProtocolException;
import com.sun.mail.iap.Response;


/**
 * Created by Marc Nuri <marc@marcnuri.com> on 2018-10-07.
 */
@Service
@RequestScope
public class SmtpService {

    private static final Logger log = LoggerFactory.getLogger(SmtpService.class);

    private static final String IMAP_PROTOCOL = "imap";
    private static final String IMAPS_PROTOCOL = "imaps";
    private static final String SMTP_PROTOCOL = "smtp";
    private static final String SMTPS_PROTOCOL = "smtps";
    private static final Pattern DATA_URI_IMAGE_PATTERN = Pattern.compile("\"data:(image\\/[^;]*?);base64,([^\\\"]*?)\"");
    private static final String STYLES =
            "body {font-family: 'Roboto', 'Calibri',  sans-serif; font-size: 1rem; color: #333}" +
            "h1 {margin: 6px 0 16px 0; font-size: 3rem; font-weight: normal}" +
            "h2 {margin: 6px 0 12px 0; font-size: 2.5rem; font-weight: normal}" +
            "h3 {margin: 6px 0 8px 0; font-size: 1.5rem; font-weight: bold}" +
            "blockquote {border-left: 5px solid #ebebeb; font-style: italic; margin: 0; padding: 0 32px}" +
            "pre.code {background-color: #ebebeb; margin: 0; padding: 8px}";

    private final MailSSLSocketFactory mailSSLSocketFactory;

    private Session session;
    private Transport smtpTransport;
    public Credentials originalCredentials;
    public String sentFolderName;

    @Autowired
    public SmtpService(MailSSLSocketFactory mailSSLSocketFactory) {
        this.mailSSLSocketFactory = mailSSLSocketFactory;
    }

    /**
     * Checks if specified {@link Credentials} are valid
     *
     * @param credentials to validate
     * @throws AuthenticationException if credentials are not valid
     */
    public void checkCredentials(Credentials credentials) {
        try {
            getSmtpTransport(credentials);
        } catch (MessagingException e) {
            throw new AuthenticationException(SMTP);
        }
    }

    public Boolean autoSentFolder( Address[] provider){

        if (provider.length > 0){
            String email = provider[0].toString();
            log.info("Address: " + email);
            if (email.contains("@gmail.com") || email.contains("@outlook.com") || email.contains("@hotmail.com") 
                || email.contains("@lefebvre.es") || email.contains("@lefebvreelderecho.com")){
                log.info("Provider stores in sent Folder automatically");
                return true;
            }
            log.info("Provider doesn't store in sent Folder automatically. Doing it Manually");
        }
        return false;
    }


    // private static RFC822DATA getRFC822Message(final IMAPFolder folder, final long uid) throws MessagingException{
    //     return (RFC822DATA) folder.doCommand(new IMAPFolder.ProtocolCommand(){
    //         public Object doCommand(IMAPProtocol p) throws IsotopeException{
    //             Response[] r = p.command("UID FETCH " + uid + " (RFC822)", null);
    //             Response response = r[r.length - 1];
    //             if (!response.isOK())
    //             {
    //                 throw new IsotopeException("Unable to retrieve message in RFC822 format");
    //             }

    //             FetchResponse fetchResponse = (FetchResponse) r[0];
    //             return fetchResponse.getItem(RFC822DATA.class);
    //         }
    //     });
    // }

    private Boolean getSentMessage(final IMAPFolder folder, final String messageId, final String subject) throws MessagingException{
        log.debug("getSentMessage");
        return (Boolean) folder.doCommand( new IMAPFolder.ProtocolCommand(){
            public Object doCommand(IMAPProtocol p)
            {
                log.debug("FolderName--> getFullName:" + folder.getFullName() + "--> getName:" + folder.getName());
                log.debug("Message-Id--> " + messageId);
                log.debug("Subject--> " + subject);               

                Response[] r = p.command("UID SEARCH HEADER Message-ID " + messageId, null);
                // Ejemplos de respuesta:
                // Encontrado gmail: * SEARCH 14, Z17 OK SEARCH completed (Success)
                // Encontrado Outlook: * SEARCH 14, D16 OK SEARCH completed.
                // Encontrado Ionos: * SEARCH, * 52 EXISTS, * 1 RECENT, BQ10 OK UID SEARCH completed
                // No encontrado: * SEARCH, P11 OK UID SEARCH completed

                log.debug(Arrays.deepToString(r));

                List<Response> a = Arrays.asList(r);
                if (a.size() > 0) {
                    for (int i = 0; i < a.size(); i++){
                        log.debug(i + " " + a.get(i).toString());
                        String[] values;
                        if (a.get(i).toString().contains("* SEARCH")){
                            values = a.get(i).toString().split(" ");
                            for (int z = 0; z < values.length; z++){
                                if (isNumeric(values[z])){
                                 return true;
                                }
                            }
                        } else if (a.get(i).toString().contains("EXISTS")){
                            values = a.get(i).toString().split(" ");
                            for (int z = 0; z < values.length; z++){
                                if (isNumeric(values[z])){
                                 return true;
                                }
                            }
                        }
                    }
                }
                return false;
            }
        });
    }

    public static boolean isNumeric(String str) {
        return str.matches("-?\\d+(\\.\\d+)?");  //match a number with optional '-' and decimal.
    }

    private void copyMsgToSentFolder(MimeMessage msg){
        //log.info("ImapStore:" + imapStore.toString());
        try {
            //log.info("STORE SENT MESSAGE BEGINNING" );
            final Session session;
            IMAPStore imapStore;
            Folder folder;
            IMAPFolder ifolder;
            
            session = Session.getInstance(initMailPropertiesImap(originalCredentials, mailSSLSocketFactory), null);
            imapStore = (IMAPStore) session.getStore(originalCredentials.getImapSsl() ? IMAPS_PROTOCOL : IMAP_PROTOCOL);
            imapStore.connect(
                originalCredentials.getServerHost(),
                originalCredentials.getServerPort(),
                originalCredentials.getUser(),
                originalCredentials.getPassword());

            folder = imapStore.getDefaultFolder();

            //Get sentFolderName
            processFolderElements(folder, false, "");
            if ((folder.getType() & Folder.HOLDS_FOLDERS) != 0) {
                Folder[] f = folder.list("%");
                for (int i = 0; i < f.length; i++)
                processFolderElements(f[i], true, "    ");
            }

            //log.info("Sent folder Name: " + sentFolderName);

            //folder = imapStore.getFolder(sentFolderName);
            ifolder = (IMAPFolder) imapStore.getFolder(sentFolderName);

            if (ifolder == null){
                log.debug("Error obteniendo el folder");
            } 
            else {
                ifolder.open(Folder.READ_WRITE);

                javax.mail.Message[] msgs = new javax.mail.Message[1];
                msgs[0] = msg;
                msgs[0].setFlag(Flags.Flag.SEEN, true);
                
                if  (!getSentMessage(ifolder, msgs[0].getHeader("Message-Id")[0], msgs[0].getHeader("Subject")[0])){
                    log.info("Hace falta dejar copia");
                    ifolder.appendMessages(msgs);
                }
                else {
                    log.info("No hace falta dejar copia");
                }
            }
            ifolder.close(true);
            imapStore.close();
        } catch (Exception e) {
            //log.info("Error de los buenos");
            throw new IsotopeException("Problem leaving a copy of the message in Sent Folder", e);
        }
    }

    String sendMessage(HttpServletRequest request, Message message) {
        try {
            final Credentials credentials = getCredentials();
            final Charset currentCharset = Charset.defaultCharset();
            final MimeMessage mimeMessage = new MimeMessage(getSession(credentials));
            final Transport smtpTransport = getSmtpTransport(credentials); 
            final TransportListener transportListener = new TransportListener(){
            
                @Override
                public void messagePartiallyDelivered(TransportEvent e) {
                    log.info("messagePartiallyDelivered");
                    if (e.getValidSentAddresses().length > 0){
                        try {
                            if (!autoSentFolder(mimeMessage.getFrom())){
                                log.info("Leaving a copy of sent message into sent folder");
                                copyMsgToSentFolder(mimeMessage);
                            } else {
                                log.info("Sent folder automatically updated");
                            }                            
                        } catch(MessagingException ex) {
                            throw new IsotopeException("Error getting messagePartiallyDelivered messageInfo", ex);
                        }
                    }
                }
            
                @Override
                public void messageNotDelivered(TransportEvent e) {
                    log.info("messageNotDelivered");
                    if (e.getValidSentAddresses().length > 0){
                        try {
                            if (!autoSentFolder(mimeMessage.getFrom())){
                                log.info("Leaving a copy of sent message into sent folder");
                                copyMsgToSentFolder(mimeMessage);
                            } else {
                                log.info("Sent folder automatically updated");
                            }                            
                        } catch (MessagingException ex) {
                            throw new IsotopeException("Error getting messageNotDelivered messageInfo", ex);
                        }
                    }
                }
            
                @Override
                public void messageDelivered(TransportEvent e) {
                    log.info("messageDelivered");
                    try {
                        log.info("MessageID:" + e.getMessage().getHeader("Message-ID")[0]);
                        
                    } catch (Exception ex123123) {
                        //TODO: handle exception
                    }
                   
                    try {
                        // if (!autoSentFolder(mimeMessage.getFrom())){
                        //     log.info("Leaving a copy of sent message into sent folder");
                        //     copyMsgToSentFolder(mimeMessage);
                        // } else {
                        //     log.info("Sent folder automatically updated");
                        // }
                        copyMsgToSentFolder(mimeMessage);
                    } catch (Exception ex1) {
                        throw new IsotopeException("Problem storing copy of message", ex1);
                    }
                }
            };
            mimeMessage.setSentDate(new Date());
            if (credentials.getUser() != null && credentials.getUser().contains("@")) {
                mimeMessage.setFrom(credentials.getUser());
            } else {
                mimeMessage.setFrom(String.format("%s@%s", credentials.getUser(), credentials.getServerHost()));
            }
            for (javax.mail.Message.RecipientType type : new javax.mail.Message.RecipientType[]{
                    MimeMessage.RecipientType.TO, MimeMessage.RecipientType.CC, MimeMessage.RecipientType.BCC
            }) {
                mimeMessage.setRecipients(type, MessageUtils.getRecipientAddresses(message, type));
            }
            mimeMessage.setSubject(message.getSubject(), currentCharset.name());

            if (message.getInReplyTo() != null) {
                mimeMessage.setHeader(HEADER_IN_REPLY_TO, String.join(" ", message.getInReplyTo()));
            }
            if (message.getReferences() != null) {
                mimeMessage.setHeader(HEADER_REFERENCES, String.join(" ", message.getReferences()));
            }

            final MimeMultipart multipart = new MimeMultipart();

            // Extract data-uri images to inline attachments
            final String originalContent = message.getContent();
            String finalContent = originalContent;
            final Matcher matcher = DATA_URI_IMAGE_PATTERN.matcher(originalContent);
            while(matcher.find()) {
                final String cid = UUID.randomUUID().toString().replace("-", "");
                final String contentType = matcher.group(1);
                final InternetHeaders headers = new InternetHeaders();
                headers.addHeader("Content-Type", contentType);
                headers.addHeader("Content-Transfer-Encoding", "base64");
                final MimeBodyPart cidImagePart = new MimeBodyPart(headers, matcher.group(2).getBytes());
                multipart.addBodyPart(cidImagePart);
                cidImagePart.setDisposition(MimeBodyPart.INLINE);
                cidImagePart.setContentID(String.format("<%s>",cid));
                cidImagePart.setFileName(String.format("%s.%s", cid, contentType.substring(contentType.indexOf('/') + 1)));
                finalContent = finalContent.replace(matcher.group(), "\"cid:" +cid +"\"");
            }

            // Include attachments
            if (message.getAttachments() != null && !message.getAttachments().isEmpty()) {
                for (Attachment attachment : message.getAttachments()) {
                    multipart.addBodyPart(toBodyPart(request, attachment));
                }
            }

            // Create body part
            final MimeBodyPart body = new MimeBodyPart();
            multipart.addBodyPart(body);
            body.setContent(new String(String.format("<html><head><style>%1$s</style></head><body><div id='scoped'>"
                            + "<style type='text/css' scoped>%1$s</style>%2$s</div></body></html>",
                            STYLES, finalContent).getBytes(), currentCharset),
                    String.format("%s; charset=\"%s\"", MediaType.TEXT_HTML_VALUE, currentCharset.name()));
            mimeMessage.setContent(multipart);
            mimeMessage.saveChanges();

            String[] messageId = mimeMessage.getHeader("Message-Id");
            smtpTransport.addTransportListener(transportListener);

            smtpTransport.sendMessage(mimeMessage, mimeMessage.getAllRecipients());

            log.info("Sending Message: " + messageId[0].toString());
                        
            return messageId[0];
        } catch(MessagingException | IOException ex) {
            throw new IsotopeException("Problem sending message", ex);
        }
    }

    @PreDestroy
    public void destroy() {
        log.debug("SmtpService destroyed");
        if(smtpTransport != null) {
            try {
                smtpTransport.close();
            } catch (MessagingException ex) {
                log.error("Error closing SMTP Transport", ex);
            }
        }
    }

    private Session getSession(Credentials credentials) {
        if (session == null) {
            originalCredentials = credentials;
            session = Session.getInstance(initMailProperties(credentials, mailSSLSocketFactory), null);
        }
        return session;
    }

    private Transport getSmtpTransport(Credentials credentials) throws MessagingException {
        if (smtpTransport == null) {
            smtpTransport = getSession(credentials).getTransport(credentials.getSmtpSsl() ? SMTPS_PROTOCOL : SMTP_PROTOCOL);
            final String smtpHost = credentials.getSmtpHost();
            smtpTransport.connect(
                    smtpHost != null && !smtpHost.isEmpty() ? smtpHost : credentials.getServerHost(),
                    credentials.getSmtpPort(),
                    credentials.getUser(),
                    credentials.getPassword());
            log.debug("Opened new SMTP transport");
        }
        return smtpTransport;
    }

    private Credentials getCredentials() {
        return (Credentials)SecurityContextHolder.getContext().getAuthentication();
    }

    private static Properties initMailProperties(Credentials credentials, MailSSLSocketFactory socketFactory) {
        final Properties ret = new Properties();
        ret.put("mail.smtp.ssl.enable", credentials.getSmtpSsl());
        ret.put("mail.smtp.connectiontimeout", DEFAULT_CONNECTION_TIMEOUT);
        ret.put("mail.smtp.ssl.socketFactory", socketFactory);
        ret.put("mail.smtp.starttls.enable", true);
        ret.put("mail.smtp.starttls.required", false);
        ret.put("mail.smtps.connectiontimeout", DEFAULT_CONNECTION_TIMEOUT);
        ret.put("mail.smtps.socketFactory", socketFactory);
        ret.put("mail.smtps.ssl.socketFactory", socketFactory);
        ret.put("mail.smtps.socketFactory.fallback", false);
        ret.put("mail.smtps.auth", true);
        return ret;
    }

    private static Properties initMailPropertiesImap(Credentials credentials, MailSSLSocketFactory mailSSLSocketFactory) {
        final Properties ret = new Properties();
        ret.put("mail.imap.ssl.enable", credentials.getImapSsl());
        ret.put("mail.imap.connectiontimeout", DEFAULT_CONNECTION_TIMEOUT);
        ret.put("mail.imap.connectionpooltimeout", DEFAULT_CONNECTION_TIMEOUT);
        ret.put("mail.imap.ssl.socketFactory", mailSSLSocketFactory);
        ret.put("mail.imap.starttls.enable", true);
        ret.put("mail.imap.starttls.required", false);
        ret.put("mail.imaps.socketFactory", mailSSLSocketFactory);
        ret.put("mail.imaps.socketFactory.fallback", false);
        ret.put("mail.imaps.ssl.socketFactory", mailSSLSocketFactory);
        return ret;
    }

    private static MimeBodyPart toBodyPart(HttpServletRequest request, Attachment attachment)
            throws MessagingException, IOException {

        final MimeBodyPart mimeAttachment = new MimeBodyPart();
        mimeAttachment.setDisposition(MimeBodyPart.ATTACHMENT);
        final String mimeType = attachment.getContentType() != null && !attachment.getContentType().isEmpty() ?
                attachment.getContentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;
        final DataSource dataSource;
        if (attachment.getContent() != null) {
            dataSource = new ByteArrayDataSource(attachment.getContent(), mimeType);
        } else {
            dataSource = new IsotopeURLDataSource(attachment.getLink(REL_DOWNLOAD).getTemplate().expand().toURL(),
                    mimeType, request);
        }
        mimeAttachment.setDataHandler(new DataHandler(dataSource));
        mimeAttachment.setFileName(MimeUtility.encodeText(attachment.getFileName()));
        return mimeAttachment;
    }


    private void processFolderElements(Folder folder, boolean recurse, String tab)
					throws Exception {
        // Uncomment this section to debug:
        // log.info(tab + "Name:      " + folder.getName());
        // log.info(tab + "Full Name: " + folder.getFullName());
        // log.info(tab + "URL:       " + folder.getURLName());
        // if (!folder.isSubscribed())
        // log.info(tab + "Not Subscribed");
        // if ((folder.getType() & Folder.HOLDS_MESSAGES) != 0) {
        //     if (folder.hasNewMessages())
        //         log.info(tab + "Has New Messages");
        //     log.info(tab + "Total Messages:  " + folder.getMessageCount());
        //     log.info(tab + "New Messages:    " + folder.getNewMessageCount());
        //     log.info(tab + "Unread Messages: " + folder.getUnreadMessageCount());
        // }
        // if ((folder.getType() & Folder.HOLDS_FOLDERS) != 0)
        //     log.info(tab + "Is Directory");

        if (folder instanceof IMAPFolder) {
            IMAPFolder f = (IMAPFolder)folder;
            String[] attrs = f.getAttributes();
            if (attrs != null && attrs.length > 0) {
                //log.info(tab + "IMAP Attributes:");
                for (int i = 0; i < attrs.length; i++){
                    //log.info(tab + "    " + attrs[i]);
                    if ("\\Sent".equals(attrs[i])){
                        //log.info("Localizado el folder de enviados ");
                        sentFolderName = f.getFullName();
                    }
                }
            }
        }
        //log.info("***");
        if ((folder.getType() & Folder.HOLDS_FOLDERS) != 0) {
            if (recurse) {
            Folder[] f = folder.list();
            for (int i = 0; i < f.length; i++)
            processFolderElements(f[i], recurse, tab + "    ");
            }
        }
    }
}