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
    gerenciarUser(req,res){

        let sql = 'select * from login';
            this.conexao.query(sql,(err,resposta)=>{
                if(err)return console.log(err);
                if(resposta){res.render('user',{users:resposta})}
        })
          
    }
    editarUser(req,res){
            
        let sql = `select * from login where id = ${req.params.id}`;
        this.conexao.query(sql,async(err,resposta)=>{

                 return await  res.render('editaUser',{
                    login:resposta[0].login,
                    id:resposta[0].id});
        });
        
    }
    altualizaUser(req,res){

        const bcrypt = require('bcryptjs');

        if(req.body.senha == '' ||req.body.Csenha == '' ){
        res.render('editaUser',{error:'Campos em branco',login:req.body.login});
        return;
        }

        if(req.body.senha !=  req.body.Csenha  ){
        res.render('editaUser',{error:'Campos Senhas Não Batem',login:req.body.login});
        return;
        }
        else{
            let senhaHash = bcrypt.hash(req.body.senha,2);
                senhaHash.then(senha => {
                    let sql = `UPDATE login SET senha=? WHERE login=?;`;
                    this.conexao.query(sql,[senha,req.body.login],
                        (err,resposta)=>{
                            if(err)err && console.log(err)
                            res.render('editaUser',{success:'senha alterada',login:req.body.login});
                        
                });
                    
    
            });       
        }

    

    }
    deletaUser(req,res){

        let deleta = (req,res) =>{
            let sql = 'delete from login where id = ?'
            this.conexao.query(sql,req.params.id,(err,resposta)=>{
                if(err){return console.log(err)}
                else{
                    res.redirect('/painel/users');
                }
                
            })
            
        }
            
    

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
                    return await deleta(req,res);
                }else{
                    res.redirect('/');
                }

            });
            
        } 
        catch (error) {

            res.redirect('/');
            
        }
       

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
    isAuthenticated(req,res,rota){
        res.locals.user ? res.redirect('/') : res.render(rota,{layout:false});  
    }

    //validação paginas comuns
    validaLogin(req,res,next){
        const jsToken = require('jsonwebtoken');
       
        if(!req.headers.cookie){
            next();
          }else{
    
            let [name,token]= req.headers.cookie.split('=');
            let decoded = jsToken.decode(token);
            decoded = jsToken.decode(token, {complete: true});
            this.conexao.query('SELECT * FROM login where id =?',decoded.payload.id,
                             
            async (err,resposta) =>{
                if(err) return console.log(err);
                if(resposta){
                  res.locals.user = decoded.payload.id;
                  
                  next();
                }else{
                  next();
                }
    
            });
    
          }
    }
    //valida rotas privadas 
    validaAdm(req,res,next){
        const jsToken = require('jsonwebtoken');
       
        if(!req.headers.cookie){
            res.redirect('/')
          }else{
    
            let [name,token]= req.headers.cookie.split('=');
            let decoded = jsToken.decode(token);
            decoded = jsToken.decode(token, {complete: true});
            this.conexao.query('SELECT * FROM login where id =?',decoded.payload.id,
                             
            async (err,resposta) =>{
                if(err) return console.log(err);
                if(resposta){
                  res.locals.user = decoded.payload.id[1];
                  next();
                }else{
                    res.redirect('/');
                }
    
            });
    
          }
    }

    
    
     
}
                    
module.exports = new Blog;