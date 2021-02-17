import Caldav from '../../services/caldavjs-nextcloud';
let vCard = require('vcard-parser');

const settings = {
  username: window.NEXTCOUD_ADMIN_USERNAME,
  password: window.NEXTCLOUD_ADMIN_PASSWD,
  server: window.NEXTCLOUD_URL,
  basePath: '/remote.php/dav',
  timezone: 'Europe/Madrid',
  principalPath: '/principals/users',
  parserLogging: true,
};

let attendees = [];

export const caldav = new Caldav(settings);

// Retrieving addressbook information
export const getAddressbooks = async () => {
    const Addressbooks = await caldav.addressbooks({
        filename: '/addressbooks/users/admin/contacts/' 
    });    
};

// Get contacts
export const getContactList = async () => {
    const contacts = await caldav.contacts({
        filename: '/addressbooks/users/admin/contacts/' 
    });    
    return listContactParser(contacts.contacts.filter((c) => c.etag !== undefined))
};

function listContactParser(list) {
    let contacts = [];

    if (list.length > 0) {
        for (let i = 0; i < list.length; i++) {
            const address = vCard.parse(list[i].address);
            // contacts.push({
            //    email: address.email[0].value,
            //    name: address.fn[0].value,
            //    phone: address.tel[0].value
            // });
            contacts.push(address.email[0].value);
        }
    }

    let items;
    items = contacts;
    return items;
}