(A) {2026-10-05} #directory_structure : follow domain-driven / feature-based structure {cm:2026-10-05}
(A) {2026-10-05} #db
  create tables
  add CRUD queries
(A) {2026-10-05} #mock_user : create mock user with mock password (stored in `.env`)
(A) {2026-10-05} #routes : also domain-driven / feature-based structure. Some routes may be shared, such as, when a single route applies operations to multiple db tables
  create routers
  create controllers
(A) {2026-10-05} #views : views follow #EJS_layout_wrapper_functions
  create main layout: `src/views/layouts/main.ejs`
  create helper render wrapper: `src/utils/render-helper.ejs`
