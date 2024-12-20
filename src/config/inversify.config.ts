import { Container } from 'inversify';
import { TYPES } from '../Types/types';
import * as controller from '../Controllers';
import * as services from '../Services';
// import * as query from '../query';
import { Helper } from '../Utiles';
import { Auth } from '../Middlewares/auth.middleware'
// import { ApiError } from '../Utiles'
import { Role } from '../Middlewares/role.middleware'



//container
const container = new Container()

//query
// for(const i in query){
//   const Query = query[i];
//   container.bind<typeof Query>(TYPES[Query.name]).to(Query)
// }

// //middleware
container.bind<Auth>(Auth).toSelf();
container.bind<Role>(Role).toSelf();

//controller
for (const i in controller) {
  const Controller = controller[i];
  container.bind<typeof Controller>(TYPES[Controller.name]).to(Controller)
}

// services
for (const i in services) {
  const Services = services[i];
  container.bind<typeof Services>(TYPES[Services.name]).to(Services)
}

// //error
// container.bind<ApiError>(ApiError).toSelf();

// helper
container.bind<Helper>(Helper).toSelf();


export default container