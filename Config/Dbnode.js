

// const mysql = require('mysql2/promise');
// const db = mysql.createPool({
//   host: 'srv621.hstgr.io',
//   user: 'u229294786_UKHrI',
//   password: 'Sawa2020!',
//   database: 'u229294786_JZfqq',

// });

// async function testConnection() {
//   try {
//     const connection = await db.getConnection();
//     console.log('تم الاتصال بقاعدة البيانات بنجاح');
//     connection.release();
//   } catch (err) {
//     console.error('خطأ في الاتصال بقاعدة البيانات:', err);
//   }
// }

// async function updateDataEverySecond() {
//   const updateQuery = `
//     UPDATE words 
//     SET writings = REPLACE(REPLACE(REPLACE(REPLACE(writings, '[', ''), ']', ''), '\"', ''), '\\\\', '')
//   `;

  
//   const deleteDuplicatesQuery = `
//     DELETE t1 FROM words t1
//     INNER JOIN words t2 
//     WHERE 
//       t1.id > t2.id AND 
//       t1.writings = t2.writings
//   `;

//   const deleteSuggestion = `
//     DELETE t1 FROM Suggestions t1
//     INNER JOIN Suggestions t2 
//     WHERE 
//       t1.id > t2.id AND 
//       t1.Suggestion = t2.Suggestion
//   `;

//   while (true) {
//     try {
//       await db.query(updateQuery);
//       console.log('تم تحديث البيانات بنجاح');

//       await db.query(deleteDuplicatesQuery);
//       console.log('تم حذف البيانات المتكررة بنجاح');

//       await db.query(deleteSuggestion);
//       console.log('تم حذف الاقتراحات المتكررة بنجاح');
//     } catch (err) {
//       console.error('خطأ في تنفيذ الاستعلام:', err);
//     }
//     await new Promise(resolve => setTimeout(resolve, 1000)); // تأخير 1 ثانية
//   }
// }

// testConnection();
// updateDataEverySecond();

// module.exports = db;






const mysql =require('mysql2');
const db = mysql.createPool({
  host: 'srv621.hstgr.io',
  user: 'u229294786_UKHrI',
  password: 'Sawa2020!',
  database: 'u229294786_JZfqq',

  // host: 'betejqbmtak0eaj63ctn-mysql.services.clever-cloud.com',
  // user: 'ufeuignwbwarfssi',
  // port: '3306',
  // password: 'Te1G6CP4sznNaOGqQypN',
  // database: 'betejqbmtak0eaj63ctn'
  
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('خطأ في الاتصال بقاعدة البيانات:', err);
    return;
  }
  console.log('تم الاتصال بقاعدة البيانات بنجاح');
  connection.release();
});

function updateDataEverySecond() {
  const updateQuery = `
    UPDATE words 
    SET writings = REPLACE(REPLACE(REPLACE(REPLACE(writings, '[', ''), ']', ''), '\"', ''), '\\\\', '')
  `;

  const deleteDuplicatesQuery = `
    DELETE t1 FROM words t1
    INNER JOIN words t2 
    WHERE 
      t1.id > t2.id AND 
      t1.writings = t2.writings
  `;
  const deleteSuggestion = `
    DELETE t1 FROM Suggestions t1
    INNER JOIN Suggestions t2 
    WHERE 
      t1.id > t2.id AND 
      t1.Suggestion = t2.Suggestion
  `;

  setInterval(() => {
    db.query(updateQuery, (err, results) => {
      if (err) {
        console.error('خطأ في تحديث البيانات:', err);
        return;
      }
      console.log('تم تحديث البيانات بنجاح');
      
      db.query(deleteDuplicatesQuery, (err, results) => {
        if (err) {
          console.error('خطأ في حذف البيانات المتكررة:', err);
          return;
        }
        console.log('تم حذف البيانات المتكررة بنجاح');
      });
      db.query(deleteSuggestion, (err, results) => {
        if (err) {
          console.error('خطأ في حذف البيانات المتكررة:', err);
          return;
        }
        console.log('تم حذف البيانات المتكررة بنجاح');
      });
    });
  }, 10000); 
}

updateDataEverySecond();

module.exports = db;
