const errorHandler = (err, req, res, next) => {
    console.error(err.message);

    res.status(500).json({
        message: 'Terjadi Keaslahan Pada Server',
        error: err.message
    })
}

module.exports = errorHandler;
