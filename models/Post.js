class Post {
    constructor(){
        this.conexao = require('../infra/mysql');
        
    }
    //verificar rotas restritas 
    verify(req,res,callBack){
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
                
                callBack()
                
               }else{
                   res.redirect('/');
               }

           });
           
       } 
       catch (error) {

           res.redirect('/');
           
       }
    }
    converteData(posts){
        const moment = require('moment');
        for(let i=0;i < posts.length;i++){
            posts[i].dataCriacao = moment(posts[i].dataCriacao)
            .format('YYYY-MM-DD HH:MM:SS');
        }
        return posts;
    }
    newPost(req,res){
        console.log(req.file.originalname);

       const moment = require('moment');
       let sql = 'INSERT INTO post (`titulo`, `post`, `categoria`,`img`,`dataCriacao`) VALUES (?,?,?,?,?)';
       if(!req.body.titulo || !req.body.post){
          return res.render('novoPost',{error:'Campos Obrigatorios em branco!'});
          
       }

       let post = [req.body.titulo,req.body.post,req.body.categoria,req.file.originalname,moment().format("YYYY-MM-DD HH:mm:ss")];

       
       this.conexao.query(sql,post, async(erro,resposta)=>{
           if(erro)return console.log(erro);
           
          await this.conexao.query(`select * from post where id = ${resposta.insertId}`,
                (err,resposta2)=>{
                    if(err){return console.log(err)}
                
                    if(resposta2)return res.render('post',{
                        id:resposta2[0].id,
                        titulo:resposta2[0].titulo,
                        post:resposta2[0].post,
                        categoria:resposta2[0].categoria,
                        img:resposta2[0].img,
                        dataCriacao: moment(resposta2[0].dataCriacao).format('YYYY-MM-DD HH:MM:SS')
                    });
            })
          

       });
       

    }
    listar(req,res,rota){
       
        let sql = 'select * from post order by id desc limit 5 ;'
        this.conexao.query(sql,(err,posts)=>{

            if(req.headers.cookie){
                const jsToken = require('jsonwebtoken');
                // get the decoded payload 
                let [name,token]= req.headers.cookie.split('=');
                let decoded = jsToken.decode(token);
                
                decoded = jsToken.decode(token, {complete: true});

                this.conexao.query('SELECT * FROM login where id =?',decoded.payload.id,
                    
                async (err,resposta) =>{

                    this.converteData(posts);

                    if(err) return console.log(err);
                    if(resposta){
                        return await res.status(200).render(rota,{user:decoded.payload.id,post:posts});
                    }else{
                        this.converteData(posts);
                        return await res.status(200).render(rota,{post:posts});
                    }
    
                });

            }else{
                this.converteData(posts); 
                return res.status(200).render(rota,{post:posts});
            } 
          
          
        })
    }
    searchPost(req,res){

        let search = req.body.search;
        let sql = `select * from post where post like ?`;
        this.conexao.query(sql,`%${search}%`,async(err,resposta)=>{
            if(err){return console.log(err)}
            else{
                
               await this.converteData(resposta)
               await res.render('ultimos',{post:resposta});
            }
        })
         
 
    } 
    showAllPost(req,res,rota){
        this.conexao.query('select * from post',(err,posts)=>{
          
            if(err) return console.log(err);
            else{  const jsToken = require('jsonwebtoken');
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
                            this.converteData(posts);
                            return await res.status(200).render(rota,
                                {id:decoded.payload.id[0],user:decoded.payload.id[1],posts:posts})
                                
                        }else{
                            res.redirect('/');
                        }
         
                    });
                    
                } 
                catch (error) {
         
                    res.redirect('/');
                    
                }
                
            }

        });


    }
    
    showPost(req,res,rota){

            if(req.headers.cookie){

                const jsToken = require('jsonwebtoken');
                // get the decoded payload 
                let [name,token]= req.headers.cookie.split('=');
                let decoded = jsToken.decode(token);
                
                decoded = jsToken.decode(token, {complete: true});

                this.conexao.query('SELECT * FROM login where id =?',decoded.payload.id,
                    
                async (err,resposta) =>{

                    if(err) return console.log(err);
                    if(resposta){

                        let id = req.params.id;
                        const moment = require('moment');
                
                        this.conexao.query('select * from post where id = ?',
                        id, async (err,post)=>{
                        post[0].dataCriacao = moment(post[0].dataCriacao).format('YYYY-MM-DD HH:MM:SS');
                        
                         if (err) { await console.log(err)}
                        
                         else{
                           
                            res.render(rota,{
                                user:decoded.payload.id[1],
                                id:post[0].id,
                                titulo:post[0].titulo,
                                post:post[0].post,
                                categoria:post[0].categoria,
                                dataCriacao:post[0].dataCriacao,
                                img:post[0].img
                            });

                             

                        }});
                               
                    }else{

                        await res.render(rota,post[0]);
                
                        
                    }
    
                });

            }else{

                let id = req.params.id;
                const moment = require('moment');
        
                this.conexao.query('select * from post where id = ?',
                id, async (err,post)=>{
                post[0].dataCriacao = moment(post[0].dataCriacao).format('YYYY-MM-DD HH:MM:SS');
                
                if(err){await console.log(err)}
                 else{ await res.render(rota,post[0]);
                }})

              
            } 
    
             
    }

    deletaPost(req,res){

     let deleta = async() =>{
            let id = parseInt(req.params.id);
                   return await this.conexao.query('DELETE FROM `post` WHERE id=?',id,
                   (err,resposta)=>{
                      if(err)return console.log(err);
                      if(resposta){this.showAllPost(req,res,'gerenciar');}
                });
     }

     this.verify(req,res,deleta);     
           
    } 
    editarPost(req,res){

    let editar = () =>{
        let id = parseInt(req.params.id);
        this.conexao.query('select * from post where id = ?',id, async (err,resposta)=>{
            
            if(err) return console.log(err);
            else{
            console.log(resposta[0].id);
         
            await res.render('editar',{
                id:resposta[0].id,
                titulo:resposta[0].titulo,
                post:resposta[0].post,
                categoria:resposta[0].categoria
             });

        }})
    }

    this.verify(req,res,editar);  


        
    }
    atualizar(req,res){
    let atualiza = () =>{

                let sql = `UPDATE post SET titulo=?,post=?,categoria=? WHERE id =?`;
                let id,titulo,post,categoria;
                id= parseInt(req.body.id);
                titulo= req.body.titulo;
                post= req.body.post;
                categoria= req.body.categoria;
        
                this.conexao.query(sql,[titulo,post,categoria,id],(err,resposta)=>{
                    if(err)return err;
                    else{
                        res.redirect(`/post/${id}`)
                    }
                });
                
        }
        
    this.verify(req,res,atualiza);         
           
    } 
       
}

module.exports = new Post;