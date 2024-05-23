const pool = require("../config/db");
class TableData {
    constructor() { }

    store = async (subject) => {
        const client = await pool.connect();
        try {
            const res = await client.query(`
                SELECT 
                    mt.subject,
                    q.ques_id,
                    q.question,
                    q.option1,
                    q.option2,
                    q.option3,
                    q.option4,
                    q.correct_answer
                FROM 
                    questions q
                JOIN
                    master_table mt  
                ON
                    q.subject_id = mt.id
                WHERE mt.subject = $1`, [subject]);

            return res.rows;
        } catch (error) {
            return error;
        } finally {
            console.log("connection release");
            client.release();
        }
    }

}

module.exports = new TableData();







