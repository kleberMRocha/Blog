
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

    //validação de rotas Publicas
    app.use((req,res,next)=>{Blog.validaLogin(req,res,next)});
    app.get('/',(req,res)=>{Post.listar(req,res,'home')});
    app.post('/',(req,res)=>{Blog.CadastraNewsletter(req,res)})
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
    app.use('/painel',(req,res,next)=>{Blog.validaAdm(req,res,next)});
    app.get('/painel',(req,res)=>{res.render('painel')});
    //lista e gerenciar usuários
    app.get('/painel/user',(req,res)=>{Blog.gerenciarUser(req,res)});
    app.get('/painel/user/:id',(req,res)=>{Blog.editarUser(req,res);});
    app.post('/painel/alterarsenha/:id',(req,res)=>{Blog.altualizaUser(req,res);});
    app.get('/painel/deleta/:id',(req,res)=>{Blog.deletaUser(req,res);})

    app.get('/painel/cadastro',(req,res)=>{res.render('cadastro');});
    app.post('/painel/cadastro',(req,res)=>{Blog.cadastroUser(req.body,res);});

    //lista e gerenciar Posts
    app.get('/painel/gerenciar',(req,res)=>{Post.showAllPost(req,res,'gerenciar')});
    app.get('/painel/gerenciar/post/:id',(req,res)=>{Post.deletaPost(req,res);});
    

    //abre o post no formulario e atualiza no banco de dados 
    app.get('/painel/editar/:id',(req,res)=>{Post.editarPost(req,res);});
    app.post('/painel/atualizar',upload.single('postImg'),(req,res)=>{Post.atualizar(req,res)});
    //adiciona um novo Post
    app.post('/painel/novoPost',upload.single('postImg'),(req,res)=>{ Post.newPost(req,res)});
    //visualiza o post apos concluido
    app.get ('/painel/novoPost',(req,res)=>{res.render('novoPost')});

    //404
    app.get('*',(req,res,next)=>{res.status('404').render('404')});

  
}


