const controller = require("../controllers/quiz.controller")
module.exports = function (app) {
    app.post("/showQuestionTable",
        controller.showData);
}