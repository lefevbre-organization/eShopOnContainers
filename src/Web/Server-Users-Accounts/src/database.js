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
//             password: '31saoGpF8ju6PtSieVZ0le0QkwClFubVKqsvNgaeI7J2ajUt2r9BL3kIIsGSewdUx0kyyp9bnARNuUTeP2R6nA=='    
//         },
//         useNewUrlParser: true      
//     })
//     .then(db => console.log('DB is connected'))
//     .catch(err => console.log(err));

// module.exports = mongoose;

