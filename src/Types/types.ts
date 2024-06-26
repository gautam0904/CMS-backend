export const TYPES = {
    //user
    UserService: Symbol.for('UserServices'),
    UserController: Symbol.for('UserController'),
  
    // content
    ContentService: Symbol.for('ContentServices'),
    ContentController: Symbol.for('ContentController'),
   
    //middleware
    Auth: Symbol.for('Auth'),
    Role : Symbol.for('Role')
  }