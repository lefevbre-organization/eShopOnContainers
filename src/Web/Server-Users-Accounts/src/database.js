const mongoose = require('mongoose');

const URI = "mongodb://localhost/users-accounts";

mongoose.connect(URI)
    .then(db => console.log('DB is connected'))
    .catch(err => console.log(err));

module.exports = mongoose;


// const mongoose = require('mongoose');

// const URI = "mongodb://mongolefebvre.documents.azure.com:10255/Lefebvre_services?ssl=true";

// mongoose.connect(URI, {
//         auth: {
//             user: 'mongolefebvre',
//             password: 'ir0EuCMlWqb6UxaeBRlRlqpPnEmvCstYqvwPN3AWAMSNjPnjv7Ul8X6CHKlmtuDYgTlrVkSPzhHb8jF79Hzeeg=='    
//         },
//         useNewUrlParser: true      
//     })
//     .then(db => console.log('DB is connected'))
//     .catch(err => console.log(err));

// module.exports = mongoose;