import mimemessage from 'mimemessage';

export class MimeBuilder {
    constructor() {
        this.currentImage = 0;
        this.root = mimemessage.factory({
            contentType: 'multipart/mixed',
            body: []
        });
    }

    addHeader(header, value) {
        this.root.header(header, value)
    }

    addAlternative(html) {
        const alternative =  mimemessage.factory({
            contentType: 'multipart/alternative',
            body: []
        });

        const textPart = mimemessage.factory({
            body: this.removeHtmlTags(html, [])
        });

        const htmlPart = this.buildHtmlPart(html);

        alternative.body.push(textPart);
        alternative.body.push(htmlPart);
        this.root.body.push(alternative);
    }

    buildHtmlPart(html) {
        const embeddedImagesList = this.getEmbeddedImages(html);
        const embeddedParts = [];

        if(embeddedImagesList.length === 0) {
            return mimemessage.factory({
                contentType: 'text/html;charset=utf-8',
                body: html
            });
        }

        const embeddedImagesIds = this.genEmbedImgIds(embeddedImagesList);

        for (let i = 0; i < embeddedImagesList.length; i++) {
            const element = embeddedImagesList[i];
            const { type, content } = this.getImageTypeAndContent(element)
            const name = this.getContentName(element);
            html = html.replace(
                `${element}`,
                `${element.replace('>', ' nosend="1">')}`
            );

            const inlinePart = mimemessage.factory({
                contentType: `${type};name="${name}"`,
                body: content
            });
            inlinePart.header('Content-Disposition', `inline; filename="${name}"`);
            inlinePart.header('Content-Transfer-Encoding', 'base64');
            inlinePart.header('X-Attachment-Id', embeddedImagesIds[i]);
            inlinePart.header('Content-ID', `<${embeddedImagesIds[i]}>`);

            embeddedParts.push(inlinePart);
        }

        html = this.formatBodyImages(
            html,
            embeddedImagesList,
            embeddedImagesIds
        );

        const relatedPart = mimemessage.factory({
            contentType: 'multipart/related',
            body: []
        });

        const htmlPart = mimemessage.factory({
            contentType: 'text/html;charset=utf-8',
            body: html
        });

        relatedPart.body.push(htmlPart);
        for(let i = 0; i < embeddedParts.length; i++) {
            relatedPart.body.push(embeddedParts[i]);
        }
        return relatedPart;
    }

    addAttachment(attachment) {
        const body = attachment.content.split(',')[1];

        const attchPart = mimemessage.factory({
            contentType: attachment.meta.type,
            contentTransferEncoding: 'base64',
            body
        });
        attchPart.header('Content-Disposition', `attachment ;filename="${attachment.meta.name}"`);
        this.root.body.push(attchPart);
    }

    toString() {
        return this.root.toString();
    }

    getContentName(imageTag) {
        let contentName;
        contentName = imageTag.replace(/.*alt="([^"]*)".*/, '$1');
        if(imageTag === contentName) {
            contentName = `image-${this.currentImage}`;
        }
        return contentName;
    }


    removeHtmlTags(body, imgList) {
        // var rex = /(<([^>]+)>)/ig;
        // return body.replace(rex, "");
        body = body
            .replace(`<br>`, `\r\n`)
            .replace(`</br>`, ``)
            .replace(`<p>`, `\r\n`)
            .replace(`</p>`, ``)
            .replace(`<strong>`, `*`)
            .replace(`</strong>`, `*`);
        for (let index = 0; index < imgList.length; index++) {
            const img = imgList[index];
            body = body.replace(img, `\r\n[image: ${this.getContentName(img)}]`);
        }
        const temp = document.createElement('div');
        temp.innerHTML = body;
        return temp.textContent || temp.innerText || '';
    }

    getImageTypeAndContent(imageTag) {
        const src = imageTag.replace(/.*src="([^"]*)".*/, '$1');
        const srcSplitted = src.split(';');
        const type = srcSplitted[0].replace('data:', '');
        const content = srcSplitted[1].replace('base64,', '')
        return { type, content };
    }

    getEmbeddedImages(body) {
        let res = [];
        let images = body.match(/<img [^>]*src="[^"]*"[^>]*>/gm) || [];
        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            if (!image.match(/src="http[^>]*/g)) {
                res.push(image);
            }
        }

        return res;
    }

    genEmbedImgIds(images) {
        let ids = [];
        for (let index = 0; index < images.length; index++) {
            const element = images[index];
            const name = this.getContentName(element);
            const random = this.uuidv4().slice(0, 8);
            ids.push(`${name.replace('.', '')}__${random}`);
        }
        return ids;
    }

    formatBodyImages(body, embedddedImagesList, embeddedImagesIds) {
        for (let index = 0; index < embedddedImagesList.length; index++) {
            const element = embedddedImagesList[index];
            const src = element.replace(/.*src="([^"]*)".*/, '$1');
            body = body.replace(src, `cid:${embeddedImagesIds[index]}`);
        }
        return body;
    }

    uuidv4() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
            (
                c ^
                (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
            ).toString(16)
        );
    }
}
