import mongoose from '@/database';
import slugify from 'slugify';

const ProjectSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: false,
  },
  descricao: {
    type: String,
    required: true,
  },
  categoria: {
    type: String,
    required: true,
  },
  featuredImage:{
    type: String,
    required: false
  },
  images:[
    {type: String}
  ],
  data: {
    type: Date,
    default: Date.now,
  },
});

ProjectSchema.pre('save', function(next){
  const titulo = this.titulo;
  this.slug = slugify(titulo);
  next();
})

export default mongoose.model('Project', ProjectSchema);
