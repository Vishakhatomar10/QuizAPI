const showQuestionTable = require("../module/quiz")

exports.showData = async (request, response) => {

  const subject = request.body.subject;

  try {
    const result = await showQuestionTable.store(subject)
    response.json({ data: result, message: 'data found' });

  } catch (error) {
    response.json({
      error: "Error",
    });
  }
};