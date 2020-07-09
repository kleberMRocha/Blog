class Post {
    constructor(){
        this.conexao = require('../infra/mysql');
        
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
    
       const moment = require('moment');
       
       let sql = 'INSERT INTO post (`titulo`, `post`, `categoria`,`img`,`dataCriacao`) VALUES (?,?,?,?,?)';
       let sql2 = 'INSERT INTO post (`titulo`, `post`, `categoria`,`dataCriacao`) VALUES (?,?,?,?)';

       if(!req.body.titulo || !req.body.post){

          return res.render('novoPost',{error:'Campos obrigatorios em branco'});
          
       }

       try {

        let post = [req.body.titulo,req.body.post,req.body.categoria,req.file.originalname,moment().format("YYYY-MM-DD HH:mm:ss")]
        this.conexao.query(sql,post, async(erro,resposta)=>{
            if(erro){return console.log(erro)}
            else{
                res.redirect(`/post/${resposta.insertId}`);
 
            }
            
        });
        
           
       } catch (error) {

        let post = [req.body.titulo,req.body.post,req.body.categoria,moment().format("YYYY-MM-DD HH:mm:ss")]
        this.conexao.query(sql2,post, async(erro,resposta)=>{
            if(erro){return console.log(erro)}
            else{
                res.redirect(`/post/${resposta.insertId}`);
 
            }
            
        });
           
       }
    

    }
    listar(req,res,rota){
        let sql = 'select * from post order by id desc limit 5 ;'
        this.conexao.query(sql,(err,posts)=>{
            if(err)console.log(err);
            else{
                res.render(rota,{post:posts})
            }

        });
        
    }
    searchPost(req,res){

        let search = req.body.search;
        let sql = `select * from post where post or titulo like ?`;
        this.conexao.query(sql,`%${search}%`,async(err,resposta)=>{
            if(err){return console.log(err)}
            else{
                    await this.converteData(resposta);
                    await res.render('ultimos',{post:resposta});
                    return;             
                }
        });
         
 
    } 
    showAllPost(req,res,rota){
        this.conexao.query('select * from post', async(err,posts)=>{
            if(err) return console.log(err);
            else{ this.converteData(posts);
            return await res.status(200).render(rota,{posts:posts})
            }                                    
        });
           
    }
    showPost(req,res,rota){
        let id = req.params.id;
        const moment = require('moment');
        let sql = 'select * from post where id = ?';

        this.conexao.query(sql,id, async (err,post) =>{
            if(post.length != 0) {                     
                post[0].dataCriacao = moment(post[0].dataCriacao).format('YYYY-MM-DD HH:MM:SS');                    
                res.render(rota,post[0]);
                }
                else{
                res.status('404').render('404');
                }
        });                   

    } 
    deletaPost(req,res){

            let id = parseInt(req.params.id);
                   return  this.conexao.query('DELETE FROM `post` WHERE id=?',id,
                   (err,resposta)=>{
                      if(err)return console.log(err);
                      if(resposta){this.showAllPost(req,res,'gerenciar');}
                });
           
    } 
    editarPost(req,res){
        
            let id = parseInt(req.params.id);
            let sql = 'select * from post where id = ?';

            this.conexao.query(sql,id, 
                async (err,resposta)=>{
                    if(err) return console.log(err);
                    if(resposta.length != 0){
                        await 
                        res.render('editar',{
                            id:resposta[0].id,
                            titulo:resposta[0].titulo,
                            post:resposta[0].post,
                            categoria:resposta[0].categoria,
                          
                        })
                    }else{ return res.status('404').render('404')}
                });
  
    }
    atualizar(req,res){

        let sqlImg = `UPDATE post SET titulo=?,post=?,categoria=?, img=? WHERE id =?`;
        let sql = `UPDATE post SET titulo=?,post=?,categoria=? WHERE id =?`;
        
        try {
            let id,titulo,post,categoria,img;

            id= parseInt(req.body.id);
            titulo= req.body.titulo;
            post= req.body.post;
            categoria= req.body.categoria;
            img = req.file.originalname;
          
            
            this.conexao.query(sqlImg,[titulo,post,categoria,img,id],(err,resposta)=>{
             
                if(err)return console.log(err);
                else{
                    
                    res.redirect(`/post/${id}`)
                }
            });
            
        } catch (error) {

            let id,titulo,post,categoria;

            id= parseInt(req.body.id);
            titulo= req.body.titulo;
            post= req.body.post;
            categoria= req.body.categoria;
       
            this.conexao.query(sql,[titulo,post,categoria,id],(err,resposta)=>{
                if(err)return console.log(err);
                else{
                    
                    res.redirect(`/post/${id}`)
                }
            });

        }

                  
    }
        
       
}

module.exports = new Post;