const db = require('../config/db');
const haversine = require('../utils/distance');

exports.addSchool = (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  if (!name || !address || isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ message: 'Invalid input data' });
  }

  const query = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
  db.query(query, [name, address, latitude, longitude], (err) => {
    if (err) return res.status(500).json({ message: 'DB Error', error: err });
    res.status(201).json({ message: 'School added successfully' });
  });
};

exports.listSchools = (req, res) => {
  const userLat = parseFloat(req.query.latitude);
  const userLon = parseFloat(req.query.longitude);

  if (isNaN(userLat) || isNaN(userLon)) {
    return res.status(400).json({ message: 'Invalid user coordinates' });
  }

  db.query('SELECT * FROM schools', (err, results) => {
    if (err) return res.status(500).json({ message: 'DB Error', error: err });

    const sorted = results.map(school => ({
      ...school,
      distance: haversine(userLat, userLon, school.latitude, school.longitude),
    })).sort((a, b) => a.distance - b.distance);

    res.json(sorted);
  });
};
