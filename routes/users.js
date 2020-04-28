const controller = require('../controllers/users')
const validateToken = require('../middleware/tokenValidator')

module.exports = (router) => {
  router.route('/users')
    .post(controller.add)
    .get(validateToken, controller.getAll)

  router.route('/auth')
    .post(controller.login)
}
