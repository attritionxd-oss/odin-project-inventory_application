(A) {2026-10-05} #directory_structure : follow domain-driven / feature-based structure {cm:2026-10-05}
(A) {2026-10-05} #db {cm:2026-10-09}
  create tables {cm:2026-10-09}
  create schema seeding utility {cm:2026-10-09}
  add service layer models {cm:2026-10-09}

(A) {2026-10-05} #mock_user : create mock user with mock password (stored in `.env`) {cm:2026-10-20}

(A) {2026-10-05} #routes : also domain-driven / feature-based structure. Some routes may be shared, such as, when a single route applies operations to multiple db tables {cm:2026-10-20}
  create routers {cm:2026-10-20}
  create controllers {cm:2026-10-20}

(A) {2026-10-05} #views : views follow #EJS_layout_wrapper_functions {cm:2026-10-13}
  create main layout: `src/views/layouts/main.ejs` {cm:2026-10-13}
  create helper render wrapper: `src/utils/render-helper.ejs` {cm:2026-10-13}

(A) {2026-10-09} #modules {cm:2026-10-20}
  #db : clean up db {cm:2026-10-13}
  #suppliers {cm:2026-10-13}
    #views : apply styles to @new.ejs {cm:2026-10-13}
  #brands {cm:2026-10-17}
    #routes {cm:2026-10-17}
    #controller {cm:2026-10-17}
    #views {cm:2026-10-17}
  #categories {cm:2026-10-17}
    #routes {cm:2026-10-17}
    #controller {cm:2026-10-17}
    #views {cm:2026-10-17}
      #breadcrumbs styling : Suggested style for breadcrumbs using `<nav class="crumbs">` and `{css}.crumb a::after{content: ">";}`, see example [here](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/nav). {cm:2026-10-17}
  #products {cm:2026-10-18}
    #routes {cm:2026-10-18}
    #controller {cm:2026-10-18}
    #views {cm:2026-10-18}
  #dashboard {cm:2026-10-20}
    #views - show indicator for record count from each module {cm:2026-10-20}

(A) {2026-10-17} create reusable validation middleware on #categories {cm:2026-10-18}
  create `src/middleware/validate.js` {cm:2026-10-18}
  create `src/modules/categories/category.validation.js` {cm:2026-10-18}
  integrate middleware into `category.routes.js` (adds `validationErrors` into `req`) {cm:2026-10-18}
  use `req.validationErrors` in `category.controller.js` {cm:2026-10-18}

(A) {2026-10-20} pre-deploy checklist
  finalize user role configurations {cm:2026-10-20}
  review role-based UI details {cm:2026-10-20}
    if required: use `res.locals.currentUser.isAuthorized` instead of controller-defined `isRoleAuthorized` variables {cm:2026-10-20}
    if not: remove all instances of `isRoleAuthorized` {cm:2026-10-20}
  use validation middlware on `brand` and `supplier` modules {cm:2026-10-20}
  review validations and escapes are in place {cm:2026-10-20}
  db-seeding {cm:2026-10-21}
    encode existing data into db seed script {cm:2026-10-21}
    truncate tables then run `db.seed.js` {cm:2026-10-21}
  replace dev passwords with prod-ready passwords
  add README.md
