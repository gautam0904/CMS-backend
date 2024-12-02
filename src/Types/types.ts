export const TYPES = {
  //user
  UserService: Symbol.for('UserServices'),
  UserController: Symbol.for('UserController'),

  // content
  ContentService: Symbol.for('ContentService'),
  ContenetController: Symbol.for('ContenetController'),

  //middleware
  Auth: Symbol.for('Auth'),
  Role: Symbol.for('Role'),

  // helper
  Helper: Symbol.for('Helper')
}
