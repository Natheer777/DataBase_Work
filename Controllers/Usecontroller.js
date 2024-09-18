const userModel = require('../Models/User');

class UserController {
  static async getAllUsers(req, res) {
    try {
      const result = await userModel.getUser();
      res.send(result);
    } catch (error) {
      res.status(500).send("Error fetching users");
    }
  }

  static async addUser(req, res) {
    const { kana, meaning, short, writings } = req.body;
    try {
      const answer = await userModel.addNewUser(kana, meaning, short, writings);
      if (answer) {
        res.send("Add successfully");
      } else {
        res.status(500).send("Add failed");
      }
    } catch (error) {
      res.status(500).send("Error adding user");
    }

  }

  static async deleteUser(req, res) {
    const { id } = req.body;
    try {
      if (id) {
        const resultId = await userModel.deleteUser(id);
        if (resultId) {
          res.send("Delete done");
        } else {
          res.status(500).send("Delete failed");
        }
      } else {
        res.status(400).send("ID is required");
      }
    } catch (error) {
      res.status(500).send("Error deleting user");
    }
  }

  static async editUser(req, res) {
    const { id, kana, meaning, short, writings } = req.body;
    try {
      if (id) {
        const editAnswer = await userModel.editUser(id, kana, meaning, short, writings);
        if (editAnswer) {
          res.send("Edit done");
        } else {
          res.status(500).send("Edit failed");
        }
      } else {
        res.status(400).send("ID is required");
      }
    } catch (error) {
      res.status(500).send("Error editing user");
    }
  }
  static async insertWords(req, res) {
    const words = req.body.words;
    if (!words || !Array.isArray(words)) {
      return res.status(400).json({ error: 'Invalid data format, expected an array of words' });
    }

    // إضافة التحقق من البيانات
    console.log('Received words:', words);

    try {
      const result = await userModel.insertWords(words);
      res.status(200).json({ message: 'Data inserted successfully', results: result });
    } catch (error) {
      console.error('Error inserting data:', error);
      res.status(500).json({ error: 'Error inserting data' });
    }
  }
  
  static async searchWords(req, res) {
    const { Term, Page, Mode } = req.body;
    try {
      const result = await userModel.searchWords(Term, Page, Mode);
      if (result.Items.length > 0) {
        res.send(result);
      } else {
        res.status(404).send({ message: 'No words found' });
      }
    } catch (error) {
      res.status(500).send({ error: 'Error searching word' });
    }
  }
  static async getSentence() {
    try {
      const result = await userModel.getSentence();
      if (!result || result.length === 0) {
        return null; // Return null if no data is found
      }
      return result;
    } catch (error) {
      console.error('Error fetching sentence data:', error.message);
      throw new Error('Error fetching sentence data.');
    }
  }
  static async getSuggestions(req, res) {
    try{
      const result = await userModel.getSuggestions()
      res.send(result)
    }catch{
      res.status(500).send("Error fetch sentence")
    }
  }



  static async addSuggestions(req, res) {
    const { Suggestion } = req.body; // Ensure Suggestion is correctly extracted
    if (!Suggestion) {
        return res.status(400).send("No suggestion provided");
    }
    try {
      const answer = await userModel.addSuggestions(Suggestion);
      if (answer) {
        res.send("Add successfully");
      } else {
        res.status(500).send("Add failed");
      }
    } catch (error) {
      console.error("Error adding suggestion:", error); // Log the error
      res.status(500).send("Error adding suggestion");
    }
}


static async deleteSuggestions(req, res) {
  const { id } = req.params;  // Get the id from the URL params
  try {
    if (id) {
      const resultId = await userModel.deleteSuggestions(id);
      if (resultId) {
        res.send("Delete done");
      } else {
        res.status(500).send("Delete failed");
      }
    } else {
      res.status(400).send("ID is required");
    }
  } catch (error) {
    res.status(500).send("Error deleting suggestion");
  }
}
}

module.exports = UserController;