require("../utils/passport");
const passport = require("passport");
const usersRoutes = require("../controllers/user.controller");
const adminRoutes = require("../controllers/admin.controller");
const { autheticationMiddleware, adminMiddleWare } = require("../utils/auth");
const { usersAuthRoutes, adminAuthRoutes } =  require("../utils/auth");

const Routers = (app) => {
  return (routers = (paths, filename) => {
    app.post("/register", usersRoutes.RegisterUser);
    app.post("/resetPassword", usersRoutes.resetPassword)
    app.post("/resetPasswordOtpCode", usersRoutes.resetPasswordOtpCode)
    app.post("/newPassword", usersRoutes.newPassword)
    app.post("/contactSubmit", usersRoutes.contactSubmit);
    app.get("/login/:id", (req, res)=>res.redirect("/login"));
    app.get("/refID/:ref", (req, res)=>res.redirect("/"));
    app.get("/faqs.html", (req, res)=>res.redirect("faq"));


    app.get(paths, (req, res) => res.render(filename, { error: req.flash("error"), success: req.flash("success"), isAuthenticated: (req.isAuthenticated() && req.user.user_id) }));
    app.post("/loginus", passport.authenticate("login", { successRedirect: "/dashboard", failureRedirect: "back", failureFlash: true, successFlash: true, }));
    app.post("/admin", passport.authenticate("admin", { successRedirect: "/adminDashboard",    failureRedirect: "/adminlogin", failureFlash: true, successFlash: true, })
    );
  });
}

const userAuthRouters = (app) => (routers = (paths, filename) => usersAuthRoutes(app)(paths, autheticationMiddleware, usersRoutes[filename]))

const adminAuthRouter = (app) => (routers = (paths, filename) => adminAuthRoutes(app)(paths, adminMiddleWare, adminRoutes[filename]))

module.exports = (app) => {
  
  Routers(app)("/", "aeoncapital/index");
  // Routers(app)("/test", "index");
  Routers(app)("/reset", "reset");
  Routers(app)("/faq", "faq");
  Routers(app)("/faqs.html", "faq");
  Routers(app)("/faqs", "faq");
  Routers(app)("/about", "about");
  Routers(app)("/login", "login");
  Routers(app)("/trial", "trial");
  Routers(app)("/forex", "forex");
  Routers(app)("/bitcoin", "bitcoin");
  Routers(app)("/pricing", "pricing");
  Routers(app)("/contact", "contact");
  Routers(app)("/features", "features");
  Routers(app)("/register", "register");
  Routers(app)("/specials", "specials");
  Routers(app)("/affiliate", "affiliate");
  Routers(app)("/adminlogin", "adminlogin");
  Routers(app)("/realestate", "realestate");
  Routers(app)("/ticker-tape", "ticker-tape");

  userAuthRouters(app)("/mining", "mining", usersRoutes);
  userAuthRouters(app)("/logout", "logout", usersRoutes);
  userAuthRouters(app)("/dashboard", "dashboard", usersRoutes);
  userAuthRouters(app)("/setting", "setting", usersRoutes);
  userAuthRouters(app)("/mining/:id", "MiningPlans", usersRoutes);
  userAuthRouters(app)("/paymemtamt", "paymemtamt", usersRoutes)
  userAuthRouters(app)("/runningPlans", "runningPlans", usersRoutes)
  userAuthRouters(app)('/removeplan/:id',"DeletePlan", usersRoutes)
  userAuthRouters(app)('/withdrawal',"withdrawal", usersRoutes)
  userAuthRouters(app)("/finalPayment", "MiningReceipts", usersRoutes);
  userAuthRouters(app)("/withdrawalRequest", "withdrawalRequest", usersRoutes);
  userAuthRouters(app)("/changePassword", "changePassword", usersRoutes);
  userAuthRouters(app)("/withdrawalUpdate/:id/:userID/:roi/:deposit", "withdrawalUpdate", usersRoutes);

  adminAuthRouter(app)("/usertopup", "usertopup", adminRoutes)
  adminAuthRouter(app)("/admin_logout", "logout", adminRoutes)
  adminAuthRouter(app)("/adminDashboard", "adminDashboard", adminRoutes)
  adminAuthRouter(app)("/removeuser/:id", "removeUser", adminRoutes)
  adminAuthRouter(app)("/removemsg/:id", "removemsg", adminRoutes)
  adminAuthRouter(app)("/approveplan/:receiptID/:userID/:packageplan", "approveplan", adminRoutes)
  adminAuthRouter(app)("/deletePlans/:planID/:userID", "deletePlans", adminRoutes)
  adminAuthRouter(app)("/deleteApprovedWithdrawal/:planID/:userID", "deleteApprovedWithdrawal", adminRoutes)
  adminAuthRouter(app)("/approvedWithdrawal/:username/:email/:wallet/:roi/:receiptID/:user_id", "approvedWithdrawal", adminRoutes)
  adminAuthRouter(app)("/adminChangePassword", "changePassword", adminRoutes);
  
};