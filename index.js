const express = require('express');
const path = require('path');
const fs = require('fs')
const cors = require('cors');
const app = express();
const port = 3001; // or any port you prefer

app.use(cors())
app.use('/videos', express.static(path.join(__dirname, 'videos')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.get('/videos', async (req, res) => {
    return res.json([
        {
            id: 1,
            name: "desktop",
            image: "http://localhost:3001/images/desktop.png",
            type: "desktop_con.mp4"
        },
        {
            id: 2,
            name: "mobile",
            image: "http://localhost:3001/images/mobile.png",
            type: "mobile_con.mp4"
        }
    ])
})

app.get('/stream/:videoName', (req, res) => {
    const videoPath = path.join(__dirname, 'videos', req.params.videoName,);
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;
    console.log(range);

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(videoPath, { start, end });
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        };

        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
