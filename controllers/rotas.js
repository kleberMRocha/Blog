
const Blog = require('../models/Blog');
const Post = require('../models/Post');

//upload de imagens
var multer  = require('multer')

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, file.originalname)
})

const upload = multer({storage: storage})

//rotas
module.exports = (app) =>{

    //Publicas
    app.get('/',(req,res)=>{Post.listar(req,res,'home')});
    //busca Post Pelo texto 
    app.post('/searchPost',(req,res)=>{Post.searchPost(req,res)});
    //mostra os ultimos Posts
    app.get('/ultimos',(req,res)=>{Post.listar(req,res,'ultimos')});
    //autenticação Login/user
    app.get('/login',(req,res)=>{ Blog.isAuthenticated(req,res,'login')});
    app.post('/login',(req,res) =>{Blog.loginAuth(req,res);});
    //mostra post
    app.get('/post/:id',(req,res)=>{Post.showPost(req,res,'post')});
    //limpa os cookie
    app.get('/logout',(req,res)=>{res.clearCookie('blogLogin');res.redirect('/')});

    //privadas
    app.get('/painel',(req,res)=>{Blog.tokenValidation(req,res,'painel');});

    //lista e gerenciar usuários
    app.get('/user',(req,res)=>{Blog.gerenciarUser(req,res)});
    app.get('/user/:id',(req,res)=>{Blog.editarUser(req,res);});
    app.post('/alterarsenha/:id',(req,res)=>{Blog.altualizaUser(req,res);});
    app.get('/deleta/:id',(req,res)=>{Blog.deletaUser(req,res);})

    app.get('/cadastro',(req,res)=>{Blog.tokenValidation(req,res,'cadastro');});
    app.post('/cadastro',(req,res)=>{Blog.cadastroUser(req.body,res);});

    //lista e gerenciar Posts
    app.get('/gerenciar',(req,res)=>{ Post.showAllPost(req,res,'gerenciar')});
    app.get('/gerenciar/post/:id',(req,res)=>{Post.deletaPost(req,res);});
    

    //abre o post no formulario e atualiza no banco de dados 
    app.get('/editar/:id',(req,res)=>{Post.editarPost(req,res);});
    app.post('/atualizar',upload.single('postImg'),(req,res)=>{Post.atualizar(req,res)});
    //adiciona um novo Post
    app.post('/novoPost',upload.single('postImg'),(req,res)=>{ Post.newPost(req,res)});
    //visualiza o post apos concluido
    app.get ('/novoPost',(req,res)=>{Blog.tokenValidation(req,res,'novoPost')});

    app.get('*',(req,res,next)=>{res.status('404').render('404')});

  
}


