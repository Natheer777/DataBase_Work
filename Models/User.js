const db = require('../Config/Dbnode'); // Assuming this is your database configuration file

class UserModel {
  static getUser() {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM words', [], (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    });
  }

  static getSuggestions(){
    return new Promise((resolve , reject) =>{
      db.query('SELECT * FROM Suggestions' ,[],(error , result) =>{
        if(error){
          return reject(error)
        }
        resolve(result)
      })
    })
  }


  static getSentence(){
    return new Promise((resolve , reject) =>{
      db.query('SELECT * FROM sentences' ,[],(error , result) =>{
        if(error){
          return reject(error)
        }
        resolve(result)
      })
    })
  }


  static addNewUser(kana, meaning, short, writings) {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO words (kana, meaning, short, writings) VALUES (?, ?, ?, ?)';
      db.query(query, [kana, meaning, short, writings], (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results.affectedRows > 0);
      });
    });
  }

  static deleteUser(id) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM words WHERE id = ?';
      db.query(query, [id], (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results.affectedRows > 0);
      });
    });
  }

  static editUser(id, kana, meaning, short, writings) {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE words SET kana = ?, meaning = ?, short = ?, writings = ? WHERE id = ?';
      db.query(query, [kana, meaning, short, writings, id], (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results.affectedRows > 0);
      });
    });
  }


    static async insertWords(words) {
      const sql = 'INSERT INTO words (kana, meaning, short, writings) VALUES ?';
      const values = words.map(word => [
        word.Kana,
        word.MeaningSummary,
        word.ShortMeaningSummary,
        JSON.stringify(word.Writings)  // تحويل writings إلى JSON
      ]);
  
      console.log('Values to insert:', values);  // التحقق من القيم قبل الإدراج
  
      return new Promise((resolve, reject) => {
        db.query(sql, [values], (error, results) => {
          if (error) {
            console.error('Database error:', error);  // تسجيل خطأ قاعدة البيانات
            return reject(error);
          }
          resolve(results);
        });
      });
    }
  
  
  

  static async searchWords(term, page, mode) {
    const offset = page * 10; // Assuming each page contains 10 results
    const searchQuery = `
      SELECT * FROM words
      WHERE kana LIKE ? OR meaning LIKE ? OR short LIKE ? OR writings LIKE ?
      LIMIT 10 OFFSET ?`;
    const countQuery = `
      SELECT COUNT(*) AS total FROM words
      WHERE kana LIKE ? OR meaning LIKE ? OR short LIKE ? OR writings LIKE ?`;
    const values = [`%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`];  // تعديل المتغير الأخير

    try {
      const [searchResults, countResults] = await Promise.all([
        new Promise((resolve, reject) => {
          db.query(searchQuery, [...values, offset], (error, results) => {
            if (error) {
              return reject(error);
            }
            resolve(results);
          });
        }),
        new Promise((resolve, reject) => {
          db.query(countQuery, values, (error, results) => {
            if (error) {
              return reject(error);
            }
            resolve(results[0].total);
          });
        })
      ]);

      return {
        Items: searchResults,
        TotalResults: countResults,
        TotalPages: Math.ceil(countResults / 10)
      };
    } catch (error) {
      throw error;
    }
  }

  static addSuggestions(Suggestion) {
    return new Promise((resolve, reject) => {
        if (!Suggestion) {
            return reject(new Error("No suggestion provided"));
        }
        const query = 'INSERT INTO Suggestions (Suggestion) VALUES (?)'; // Make sure column name matches
        console.log("Inserting suggestion:", Suggestion); // Log for debugging
        db.query(query, [Suggestion], (error, results) => {
            if (error) {
                console.error("Database error:", error); // Log the error
                return reject(error);
            }
            resolve(results.affectedRows > 0);
        });
    });
}
static deleteSuggestions(id) {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM Suggestions WHERE id = ?';
    db.query(query, [id], (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results.affectedRows > 0);
    });
  });
  
}
}

module.exports = UserModel;
