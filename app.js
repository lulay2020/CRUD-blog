let methodOverride = require('method-override'),
	express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	expressSanitizer = require('express-sanitizer'),
	mongoose = require('mongoose');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer())
app.use(methodOverride('_method'));

const db = process.env.MONGO_URI;
// DB Config
mongoose.connect(db, {
	useNewUrlParser: true, 
	useUnifiedTopology: true,
	useCreateIndex: true
});

// Blog Schema
const blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created :{
		type: Date,
		default: Date.now
	}
})

const Blog = mongoose.model('Blog', blogSchema);

// **************
// RESTful Routes
// **************

app.get('/', (req, res)=>{
	res.redirect('/blogs');
});

app.get('/blogs', (req, res)=>{
	Blog.find({}, (err, blogs)=>{
		if (err) {
			console.log(err);
		}else{
			res.render('index', {blogs: blogs});
		}
	})
});

app.post('/blogs', (req, res)=>{
	req.body.blog.body = req.sanitize(req.body.blog.body)
	Blog.create(req.body.blog, (err, newBlog)=>{
		if (err) {
			res.render('new');
		}else{
			res.redirect('/blogs')
		}
	});
})

app.get('/new', (req, res)=>{
	res.render('new');
})

app.get('/blogs/:id', (req, res)=>{
	Blog.findById(req.params.id, (err, returnedBlog)=>{
		if (err) {
			console.log(err);
		}else{
			res.render('show', {blog:returnedBlog});
		}
	})
})

app.get('/blogs/:id/edit', (req, res)=>{
	Blog.findById(req.params.id ,(err, blog)=>{
		if (err) {
			res.redirect('/blogs/')
		}else{
			res.render('edit', {blog:blog})
		}
	})
})

app.put('/blogs/:id', (req, res)=>{
	req.body.blog.body = req.sanitize(req.body.blog.body)
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog)=>{
		if (err) {
			res.redirect('/blogs');
		}else{
			res.redirect('/blogs/' + req.params.id);
		}
	});

})

app.delete('/blogs/:id', (req , res)=>{
	Blog.findByIdAndRemove(req.params.id, (err)=>{
		if (err) {
			res.redirect('/blogs/'+ req.params.id)
		}else{
			res.redirect('/blogs');
		}
	})
})

const port = process.env.PORT || 3000;
app.listen(port, ()=>{
	console.log('I AM ON !!!')
})