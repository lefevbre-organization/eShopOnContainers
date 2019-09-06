const express = require('express');
const router = express.Router();

const Account = require('../models/account');

router.get('/', async (req, res) => {
    const accounts = await Account.find();
    console.log(accounts);
    res.json(accounts)
});

router.get('/:id', async (req, res) => {
    const account = await Account.findById(req.params.id);
    res.json(account)
});

router.get('/user/:id', async (req, res) => {
    await Account.find({
        user: req.params.id
    })
    .sort('-defaultAccount')
    .exec(function(err, accounts) {
        if (err) {
            throw err;
        }         
        console.log(accounts);
        res.json(accounts)
    });    
});

router.post('/defaultaccount/:user/:provider/:email', function (req, res) {
    Account.find({
        user: req.params.user,
        provider: req.params.provider
    }, function(err, accounts) {
    if (!accounts) {
        const account = new Account({ 
            user: req.params.user, 
            provider: req.params.provider, 
            email: req.params.email, 
            defaultAccount: true });
        account.save().then(account => {
            res.json({ status: 'Account saved' });
        })
        .catch(err => {
            res.json({ status: 'Error in save account' });
        });                    
    } else {
        console.log('accounts ->', accounts);
        const exists = accounts.some(account => (account.provider === req.params.provider));
        if (exists) {
            const cloneAccounts = accounts.slice();
            cloneAccounts.map(function(account, i) {
                if (account.provider === req.params.provider) {
                    const newAccount = { 
                        user: account.user, 
                        provider: account.provider, 
                        email: account.email, 
                        defaultAccount: true
                    };
                    Account.findByIdAndUpdate(account._id, newAccount)
                    .then(
                        console.log(`IN if ... update -> ${account._id}`)
                    )
                    .catch(err => {
                        console.log(`ERROR -> ${err}`)
                    });
                } else {
                    const newAccount = { 
                        user: account.user, 
                        provider: account.provider, 
                        email: account.email, 
                        defaultAccount: false
                    };
                    Account.findByIdAndUpdate(account._id, newAccount)
                    .then(
                        console.log(`IN else ... update -> ${account._id}`)
                    )
                    .catch(err => {
                        console.log(`ERROR -> ${err}`)
                    });
                }
            });            
            res.json({ status: 'USERS-ACCOUNTS updated' });    
        } else {
            accounts.map(function(account, i) {
                const newAccount = { 
                    user: account.user, 
                    provider: account.provider,
                    email: account.email,
                    defaultAccount: false
                };    
                Account.findByIdAndUpdate(account._id, newAccount).then(
                    console.log(`update -> ${account._id}`)
                );                
            });
            const account = new Account({ 
                user: req.params.user, 
                provider: req.params.provider, 
                email: req.params.email, 
                defaultAccount: true
            });
            account.save();
            res.json({ status: 'USERS-ACCOUNTS updated' });
        }
    }
  });
});

router.post('/deleteaccount', function (req, res) {
    const { user, provider, email } = req.body;
    // console.log(`user -> ${user}, provider -> ${provider}, email -> ${email}`);
    Account.find({
        user: user,
        provider: provider,
        email: email
    }, function(err, accounts) {
        if (accounts) {
            accounts.map(function(account){
                Account.findByIdAndRemove(account._id)
                    .then(
                        console.log(`Delete _id -> ${account._id}`)
                    )
                    .catch(error => {
                        console.log('error ->', error);
                    });
            });
        }
        res.json({ status: 'USERS-ACCOUNTS updated' });
    });
});

router.post('/deleteaccountbyprovider', function (req, res) {
    const { user, provider } = req.body;
    // console.log(`user -> ${user}, provider -> ${provider}`);
    Account.find({
        user: user,
        provider: provider
    }, function(err, accounts) {
        if (accounts) {
            accounts.map(function(account){
                Account.findByIdAndRemove(account._id)
                    .then(
                        console.log(`Delete _id -> ${account._id}`)
                    )
                    .catch(error => {
                        console.log('error ->', error);
                    });
            });
        }
        res.json({ status: 'USERS-ACCOUNTS updated' });
    });
});

router.post('/resetdefaultaccount/:user', function (req, res) {
    Account.find({
        user: req.params.user
    }, function(err, accounts) {
        accounts.map(function(account) {
            const newAccount = { 
                user: account.user, 
                provider: account.provider,
                email: account.email,
                defaultAccount: false
            };    
            Account.findByIdAndUpdate(account._id, newAccount).then(
                console.log(`update -> ${account._id}`)
            );                
        });
        res.json({ status: 'USERS-ACCOUNTS updated' });
    });
});


router.post('/', async (req, res) => {
    const { user, provider, email, defaultAccount } = req.body;
    const account = new Account({ user, provider, email, defaultAccount });
    await account.save();
    res.json({ status: 'Account saved' });
});

router.put('/:id', async (req, res) => {
    const { user, provider, email, defaultAccount } = req.body;
    const newAccount = { user, provider, email, defaultAccount };
    await Account.findByIdAndUpdate(req.params.id, newAccount);
    res.json({ status: 'Account updated' });
});

router.delete('/:id', async (req, res) => {
    await Account.findByIdAndRemove(req.params.id);
    res.json({ status: 'Account deleted' });
});

module.exports = router;