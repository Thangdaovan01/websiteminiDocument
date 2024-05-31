const express = require('express');
// const pool = require('../config/connectDB');
const fs = require('fs');
const path = require('path');

const getLoginPage = async (req, res) => {
    try {
        return res.status(200).render('login');
    } catch (error) {
        console.error(error);
        return res.status(404).json('Server error');
    }
}


const getHomepage = async (req, res) => {
    try {
        return res.status(200).render('index');
    } catch (error) {
        console.error(error);
        return res.status(404).json('Server error');
    }
}

const getDocument = async (req, res) => {
    try {
        return res.status(200).render('document');
    } catch (error) {
        console.error(error);
        return res.status(404).json('Server error');
    }
} 
const getDocumentFilename = async (req, res) => {
    try {
        return res.status(200).render('documentfile');
        // const directoryPath = path.join(__dirname, 'uploads', 'documents');
        // fs.readdir(directoryPath, (err, files) => {
        //     if (err) {
        //         console.log('Unable to scan directory: ' + err);
        //         return res.status(500).send('Unable to scan directory');
        //     } 
            
        //     res.render('documentfile', { files });
        // });
    } catch (error) {
        console.error(error);
        return res.status(404).json('Server error');
    }
}
module.exports = {
    getLoginPage, getHomepage, getDocument, getDocumentFilename
}