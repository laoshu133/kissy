module.exports=function(req,res){
    res.render('runner',{
        component:'tabs',
        externalLinks:[
            '/kissy/src/button/assets/dpl.css',
            '/kissy/src/tabs/assets/dpl.css'
        ],
        query: req.query
    });
};