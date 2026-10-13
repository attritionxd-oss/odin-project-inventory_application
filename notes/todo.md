(A) {2026-10-05} #directory_structure : follow domain-driven / feature-based structure {cm:2026-10-05}
(A) {2026-10-05} #db {cm:2026-10-09}
  create tables {cm:2026-10-09}
  create schema seeding utility {cm:2026-10-09}
  add service layer models {cm:2026-10-09}

(A) {2026-10-05} #mock_user : create mock user with mock password (stored in `.env`)

(A) {2026-10-05} #routes : also domain-driven / feature-based structure. Some routes may be shared, such as, when a single route applies operations to multiple db tables
  create routers
  create controllers

(A) {2026-10-05} #views : views follow #EJS_layout_wrapper_functions {cm:2026-10-13}
  create main layout: `src/views/layouts/main.ejs` {cm:2026-10-13}
  create helper render wrapper: `src/utils/render-helper.ejs` {cm:2026-10-13}

(A) {2026-10-09} #modules
  #db : clean up db {cm:2026-10-13}
  #suppliers {cm:2026-10-13}
    #views : apply styles to @new.ejs {cm:2026-10-13}
  #brands
    #routes 
    #controller
    #views 
  #categories
    #routes 
    #controller
    #views 
  #products
    #routes 
    #controller
    #views 
  #product_variations
    #routes 
    #controller
    #views 
  #line_items
    #routes 
    #controller
    #views 
  #stock_movements
    #routes 
    #controller
    #views 

