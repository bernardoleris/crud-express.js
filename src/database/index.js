import mongoose from 'mongoose';

mongoose.connect('mongodb://127.0.0.1::1:27017/base-backend', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
mongoose.Promise = global.Promise;

export default mongoose;
