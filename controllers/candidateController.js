const pool = require('../config/database');
const { executeQuery } = require('../services/db');

const viewCandidate = (req, res) => {
  const { username, id } = req.query;

  const getUser = (username, id) => {
    let userQuery = `SELECT id, nim, username, name, major, faculty, status, description FROM user WHERE status = 'candidate'`;
    const values = [];

    if (username) {
      userQuery += ` AND username = ?`;
      values.push(username);
    }

    if (id) {
      userQuery += ` AND id = ?`;
      values.push(id);
    }

    return executeQuery(userQuery, values);
  };

  const getPosts = (userId) => {
    const postQuery = `SELECT * FROM post WHERE user_id = ?`;
    return executeQuery(postQuery, [userId]);
  };

  const getComments = (postId) => {
    const commentQuery = `
    SELECT c.id, c.user_id, u.username AS username, u.name AS name, c.post_id, c.content, c.timestamp
    FROM comment AS c
    JOIN user AS u ON c.user_id = u.id 
    WHERE post_id = ?`;
    return executeQuery(commentQuery, [postId]);
  };

  getUser(username, id)
    .then((userResults) => {
      if (userResults.length === 0) {
        return res.status(404).json({ message: 'Candidate not found!' });
      }

      const candidatesData = userResults.map((user) => {
        const userData = {
          id: user.id,
          nim: user.nim,
          username: user.username,
          name: user.name,
          major: user.major,
          faculty: user.faculty,
          status: user.status,
          description: user.description,
          posts: []
        };

        return getPosts(user.id)
          .then((posts) => {
            const getCommentsPromises = posts.map((post) => {
              return getComments(post.id);
            });

            return Promise.all(getCommentsPromises)
              .then((commentResults) => {
                posts.forEach((post, index) => {
                  post.comments = commentResults[index];
                });
                userData.posts = posts;
                return userData;
              });
          });
      });

      return Promise.all(candidatesData)
        .then((candidateData) => {
          res.json(candidateData);
        });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
};

module.exports = {
  viewCandidate,
}
