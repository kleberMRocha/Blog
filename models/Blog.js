class Blog{
    init(conexao){
        this.conexao = conexao;
        this.createTableLogin();
        this.createAdmin();
        this.createTablePost();
        
    }
    createTableLogin(){
        const sql = `create table if not exists login(
            id int not null auto_increment,
            login varchar(50) not null,
            senha varchar(200) not null,
            primary key(id)
            );`

          
        this.conexao.query(sql,(err,res)=> err && console.log(err) 
        || res && console.log('Tabela Login Criada'));   
        
    }
    createAdmin(){
   
        this.conexao.query('select id from login limit 1',(err,res)=>{

            if(err){
                console.log(err)
            }else{
              if(res == ''){

                const insert = (senhaHash)=>{
                    const sql = `INSERT INTO login (login, senha) VALUES ('admin', '${senhaHash}');`
                    this.conexao.query(sql,(err,res)=> err && console.log(err) 
                    || res && console.log('User:admin,Senha:admin')); 
                    return;
                    
                }

                const bcrypt = require('bcryptjs');  
                let senhaHash = bcrypt.hash('admin',2);

                senhaHash.then((senha)=>{
                    insert(senha);
                 
                });
                    

              }else{
                  return;
              }
            }

        

        });
        
    }
    createTablePost(){
        const sql = `create table if not exists post(
            id int not null auto_increment,
            titulo varchar(200) not null,
            post text not null,
            categoria varchar(20),
            img varchar(500),
            dataCriacao datetime, 
            primary key(id));`

        this.conexao.query(sql,(err,res)=> err && console.log(err) 
        || res && console.log('Tabela Post Criada!'));   
    }
    cadastroUser(userInfo,res){
        const bcrypt = require('bcryptjs');

        this.conexao.query('select login from login where login = ?',userInfo.user,
        (err,resposta)=>{ 
            
               if(resposta.length != 0){

                    res.render('cadastro',{error:'usuário já existe'});
               
               }else{

                   if(userInfo.user == '' || userInfo.senha == ''){
                        res.render('cadastro',{error:'Campos em branco'});
                        return;
                   }
            
                   if(userInfo.senha === userInfo.Csenha){
            
                       let senhaHash = bcrypt.hash(userInfo.senha,2);
                           senhaHash.then(senha => {
            
                           let sql = `INSERT INTO login (login, senha) VALUES (?,?);`
                     
            
                           
                           this.conexao.query(sql,[userInfo.user,senha],
                               (err,resposta)=>{
                                   if(err)err && console.log(err) 
                                   res.render('cadastro',{success:'Usuário cadastrado!'});
                               
                       });
                           
            
                   });
            
                       
                   }else{
            
                       res.render('cadastro',{error:'campos senha e Confirmar Senha com valores diferentes'});
                   }
               }
          
       }); 

          
    }
    loginAuth(req,res){
     const bcrypt = require('bcryptjs');
     const jsToken = require('jsonwebtoken');

     this.conexao.query('SELECT * FROM login where login =?',req.body.user, 
     async(err,resposta) => {

       if(resposta == ''){
          await res.render('login',{error :'User ou senha invalidos',layout: false});
          return;
       }
      
       if(resposta){ 
         bcrypt.compare(req.body.senha,resposta[0].senha)
         .then(bcryptRes => {
             if(!bcryptRes){
                 res.render('login',{error :'User ou senha invalidos',layout: false});
             }else{
                let id = [resposta[0].id,resposta[0].login];
             
                const token = jsToken.sign({id},resposta[0].senha,{expiresIn:'90d'});
                const cookieOptions = {
                    expires:new Date(Date.now()+ 90 * 24 * 60 * 1000),
                    httpOnly:true,
                }

                res.cookie('blogLogin',token,cookieOptions);
                res.status(201).redirect('/painel');

             }
         })
         .catch(err => console.log(err));
         
       }
       
     });

    }
    tokenValidation(req,res,rota){

     const jsToken = require('jsonwebtoken');

      if(!req.headers.cookie){
          return res.status(401).redirect('/');
      }

      let [name,token]= req.headers.cookie.split('=');
   
      if(name != 'blogLogin'){
         return res.status(401).redirect('/');
      }


        let decoded = jsToken.decode(token);
        // get the decoded payload 
        try {

            decoded = jsToken.decode(token, {complete: true});

            this.conexao.query('SELECT * FROM login where id =?',decoded.payload.id[0],
                
            async (err,resposta) =>{
                if(err) return console.log(err);
                if(resposta){
                    return await res.status(200).render(rota,
                        {id:decoded.payload.id[0],user:decoded.payload.id[1]})
                }else{
                    res.redirect('/');
                }

            });
            
        } 
        catch (error) {

            res.redirect('/');
            
        }
        


    }
    isAuthenticated(req,res,rota){

     const jsToken = require('jsonwebtoken');
        
        // login exception
        if(rota == 'login' && !req.headers.cookie){return res.render('login',{layout:false})}
        else if(rota == 'login' && req.headers.cookie){return res.redirect('/')}
        
        
        try {
            if(req.headers.cookie){

                     // get the decoded payload 
                     let [name,token]= req.headers.cookie.split('=');
                     let decoded = jsToken.decode(token);
                     
                     decoded = jsToken.decode(token, {complete: true});
 
                     this.conexao.query('SELECT * FROM login where id =?',decoded.payload.id,
                         
                     async (err,resposta) =>{
                         if(err) return console.log(err);
                         if(resposta){
                             return await res.status(200).render(rota,{user:decoded.payload.id});
                         }else{
                             return await res.status(200).render(rota);
                         }
         
                     });
            }else return res.status(200).render(rota)
        } 
             
        catch(error){return res.redirect('/') && console.log(error);}
                 
    }
    
     
}
                    
module.exports = new Blog;