"use strict";

var app = angular.module("PithApp", ["PithFilters", "ui.bootstrap"]);

app.controller("MainController", function() {
    this.channels = [
        {
            'title': 'Files',
            'class': 'files'
        },
        {
            'title': 'Movies',
            'class': 'movies'
        },
        {
            'title': 'TV Shows',
            'class': 'tv'
        },
        {
            'title': 'Music',
            'class': 'music'
        },
        {
            'title': 'Spotify',
            'class': 'spotify'
        }
    ];
    
    this.activeChannel = 'movies';
    
    this.library = [
        {
            'thumbnail': 'static/MV5BMTc1MjQ3ODAyOV5BMl5BanBnXkFtZTgwNjI1NDQ0MTE@._V1_SX214_AL_.jpg',
            'title': 'Transcendence',
            'year': 2014,
            'imdbRating': 6.4,
            'genres': ['Drama','Mystery','Sci-Fi'],
            'tags': ['1080p', 'x264'],
            'runtime': 119
        },
        {
            'thumbnail': 'static/MV5BMjAwMzAzMzExOF5BMl5BanBnXkFtZTgwOTcwMDA5MTE@._V1_SX214_AL_.jpg',
            'title': 'Maleficent',
            'year': 2014,
            'imdbRating': 7.4,
            'genres': ['Action','Adventure','Family'],
            'tags': ['1080p', 'x264'],
            'runtime': 97
        },
        {
            'thumbnail': 'static/MV5BODcxMzY3ODY1NF5BMl5BanBnXkFtZTgwNzg1NDY4MTE@._V1_SX214_AL_.jpg',
            'title': 'Lucy',
            'year': 2014,
            'imdbRating': 6.6,
            'genres': ['Action','Sci-Fi'],
            'tags': ['1080p', 'x264'],
            'runtime': 89
        },
        {
            'thumbnail': 'static/MV5BMTc1MjQ3ODAyOV5BMl5BanBnXkFtZTgwNjI1NDQ0MTE@._V1_SX214_AL_.jpg',
            'title': 'Transcendence',
            'year': 2014,
            'imdbRating': 6.4,
            'genres': ['Drama','Mystery','Sci-Fi'],
            'tags': ['1080p', 'x264'],
            'runtime': 119
        },
        {
            'thumbnail': 'static/MV5BMjAwMzAzMzExOF5BMl5BanBnXkFtZTgwOTcwMDA5MTE@._V1_SX214_AL_.jpg',
            'title': 'Maleficent',
            'year': 2014,
            'imdbRating': 7.4,
            'genres': ['Action','Adventure','Family'],
            'tags': ['1080p', 'x264'],
            'runtime': 97
        },
        {
            'thumbnail': 'static/MV5BODcxMzY3ODY1NF5BMl5BanBnXkFtZTgwNzg1NDY4MTE@._V1_SX214_AL_.jpg',
            'title': 'Lucy',
            'year': 2014,
            'imdbRating': 6.6,
            'genres': ['Action','Sci-Fi'],
            'tags': ['1080p', 'x264'],
            'runtime': 89
        },
        {
            'thumbnail': 'static/MV5BMTc1MjQ3ODAyOV5BMl5BanBnXkFtZTgwNjI1NDQ0MTE@._V1_SX214_AL_.jpg',
            'title': 'Transcendence',
            'year': 2014,
            'imdbRating': 6.4,
            'genres': ['Drama','Mystery','Sci-Fi'],
            'tags': ['1080p', 'x264'],
            'runtime': 119
        },
        {
            'thumbnail': 'static/MV5BMjAwMzAzMzExOF5BMl5BanBnXkFtZTgwOTcwMDA5MTE@._V1_SX214_AL_.jpg',
            'title': 'Maleficent',
            'year': 2014,
            'imdbRating': 7.4,
            'genres': ['Action','Adventure','Family'],
            'tags': ['1080p', 'x264'],
            'runtime': 97
        },
        {
            'thumbnail': 'static/MV5BODcxMzY3ODY1NF5BMl5BanBnXkFtZTgwNzg1NDY4MTE@._V1_SX214_AL_.jpg',
            'title': 'Lucy',
            'year': 2014,
            'imdbRating': 6.6,
            'genres': ['Action','Sci-Fi'],
            'tags': ['1080p', 'x264'],
            'runtime': 89
        },
        {
            'thumbnail': 'static/MV5BMTc1MjQ3ODAyOV5BMl5BanBnXkFtZTgwNjI1NDQ0MTE@._V1_SX214_AL_.jpg',
            'title': 'Transcendence',
            'year': 2014,
            'imdbRating': 6.4,
            'genres': ['Drama','Mystery','Sci-Fi'],
            'tags': ['1080p', 'x264'],
            'runtime': 119
        },
        {
            'thumbnail': 'static/MV5BMjAwMzAzMzExOF5BMl5BanBnXkFtZTgwOTcwMDA5MTE@._V1_SX214_AL_.jpg',
            'title': 'Maleficent',
            'year': 2014,
            'imdbRating': 7.4,
            'genres': ['Action','Adventure','Family'],
            'tags': ['1080p', 'x264'],
            'runtime': 97
        },
        {
            'thumbnail': 'static/MV5BODcxMzY3ODY1NF5BMl5BanBnXkFtZTgwNzg1NDY4MTE@._V1_SX214_AL_.jpg',
            'title': 'Lucy',
            'year': 2014,
            'imdbRating': 6.6,
            'genres': ['Action','Sci-Fi'],
            'tags': ['1080p', 'x264'],
            'runtime': 89
        },
        {
            'thumbnail': 'static/MV5BMTc1MjQ3ODAyOV5BMl5BanBnXkFtZTgwNjI1NDQ0MTE@._V1_SX214_AL_.jpg',
            'title': 'Transcendence',
            'year': 2014,
            'imdbRating': 6.4,
            'genres': ['Drama','Mystery','Sci-Fi'],
            'tags': ['1080p', 'x264'],
            'runtime': 119
        },
        {
            'thumbnail': 'static/MV5BMjAwMzAzMzExOF5BMl5BanBnXkFtZTgwOTcwMDA5MTE@._V1_SX214_AL_.jpg',
            'title': 'Maleficent',
            'year': 2014,
            'imdbRating': 7.4,
            'genres': ['Action','Adventure','Family'],
            'tags': ['1080p', 'x264'],
            'runtime': 97
        },
        {
            'thumbnail': 'static/MV5BODcxMzY3ODY1NF5BMl5BanBnXkFtZTgwNzg1NDY4MTE@._V1_SX214_AL_.jpg',
            'title': 'Lucy',
            'year': 2014,
            'imdbRating': 6.6,
            'genres': ['Action','Sci-Fi'],
            'tags': ['1080p', 'x264'],
            'runtime': 89
        },
        {
            'thumbnail': 'static/MV5BMTc1MjQ3ODAyOV5BMl5BanBnXkFtZTgwNjI1NDQ0MTE@._V1_SX214_AL_.jpg',
            'title': 'Transcendence',
            'year': 2014,
            'imdbRating': 6.4,
            'genres': ['Drama','Mystery','Sci-Fi'],
            'tags': ['1080p', 'x264'],
            'runtime': 119
        },
        {
            'thumbnail': 'static/MV5BMjAwMzAzMzExOF5BMl5BanBnXkFtZTgwOTcwMDA5MTE@._V1_SX214_AL_.jpg',
            'title': 'Maleficent',
            'year': 2014,
            'imdbRating': 7.4,
            'genres': ['Action','Adventure','Family'],
            'tags': ['1080p', 'x264'],
            'runtime': 97
        },
        {
            'thumbnail': 'static/MV5BODcxMzY3ODY1NF5BMl5BanBnXkFtZTgwNzg1NDY4MTE@._V1_SX214_AL_.jpg',
            'title': 'Lucy',
            'year': 2014,
            'imdbRating': 6.6,
            'genres': ['Action','Sci-Fi'],
            'tags': ['1080p', 'x264'],
            'runtime': 89
        },
        {
            'thumbnail': 'static/MV5BMTc1MjQ3ODAyOV5BMl5BanBnXkFtZTgwNjI1NDQ0MTE@._V1_SX214_AL_.jpg',
            'title': 'Transcendence',
            'year': 2014,
            'imdbRating': 6.4,
            'genres': ['Drama','Mystery','Sci-Fi'],
            'tags': ['1080p', 'x264'],
            'runtime': 119
        },
        {
            'thumbnail': 'static/MV5BMjAwMzAzMzExOF5BMl5BanBnXkFtZTgwOTcwMDA5MTE@._V1_SX214_AL_.jpg',
            'title': 'Maleficent',
            'year': 2014,
            'imdbRating': 7.4,
            'genres': ['Action','Adventure','Family'],
            'tags': ['1080p', 'x264'],
            'runtime': 97
        },
        {
            'thumbnail': 'static/MV5BODcxMzY3ODY1NF5BMl5BanBnXkFtZTgwNzg1NDY4MTE@._V1_SX214_AL_.jpg',
            'title': 'Lucy',
            'year': 2014,
            'imdbRating': 6.6,
            'genres': ['Action','Sci-Fi'],
            'tags': ['1080p', 'x264'],
            'runtime': 89
        },
        {
            'thumbnail': 'static/MV5BMTc1MjQ3ODAyOV5BMl5BanBnXkFtZTgwNjI1NDQ0MTE@._V1_SX214_AL_.jpg',
            'title': 'Transcendence',
            'year': 2014,
            'imdbRating': 6.4,
            'genres': ['Drama','Mystery','Sci-Fi'],
            'tags': ['1080p', 'x264'],
            'runtime': 119
        },
        {
            'thumbnail': 'static/MV5BMjAwMzAzMzExOF5BMl5BanBnXkFtZTgwOTcwMDA5MTE@._V1_SX214_AL_.jpg',
            'title': 'Maleficent',
            'year': 2014,
            'imdbRating': 7.4,
            'genres': ['Action','Adventure','Family'],
            'tags': ['1080p', 'x264'],
            'runtime': 97
        },
        {
            'thumbnail': 'static/MV5BODcxMzY3ODY1NF5BMl5BanBnXkFtZTgwNzg1NDY4MTE@._V1_SX214_AL_.jpg',
            'title': 'Lucy',
            'year': 2014,
            'imdbRating': 6.6,
            'genres': ['Action','Sci-Fi'],
            'tags': ['1080p', 'x264'],
            'runtime': 89
        },
        {
            'thumbnail': 'static/MV5BMTc1MjQ3ODAyOV5BMl5BanBnXkFtZTgwNjI1NDQ0MTE@._V1_SX214_AL_.jpg',
            'title': 'Transcendence',
            'year': 2014,
            'imdbRating': 6.4,
            'genres': ['Drama','Mystery','Sci-Fi'],
            'tags': ['1080p', 'x264'],
            'runtime': 119
        },
        {
            'thumbnail': 'static/MV5BMjAwMzAzMzExOF5BMl5BanBnXkFtZTgwOTcwMDA5MTE@._V1_SX214_AL_.jpg',
            'title': 'Maleficent',
            'year': 2014,
            'imdbRating': 7.4,
            'genres': ['Action','Adventure','Family'],
            'tags': ['1080p', 'x264'],
            'runtime': 97
        },
        {
            'thumbnail': 'static/MV5BODcxMzY3ODY1NF5BMl5BanBnXkFtZTgwNzg1NDY4MTE@._V1_SX214_AL_.jpg',
            'title': 'Lucy',
            'year': 2014,
            'imdbRating': 6.6,
            'genres': ['Action','Sci-Fi'],
            'tags': ['1080p', 'x264'],
            'runtime': 89
        },
        {
            'thumbnail': 'static/MV5BMTc1MjQ3ODAyOV5BMl5BanBnXkFtZTgwNjI1NDQ0MTE@._V1_SX214_AL_.jpg',
            'title': 'Transcendence',
            'year': 2014,
            'imdbRating': 6.4,
            'genres': ['Drama','Mystery','Sci-Fi'],
            'tags': ['1080p', 'x264'],
            'runtime': 119
        },
        {
            'thumbnail': 'static/MV5BMjAwMzAzMzExOF5BMl5BanBnXkFtZTgwOTcwMDA5MTE@._V1_SX214_AL_.jpg',
            'title': 'Maleficent',
            'year': 2014,
            'imdbRating': 7.4,
            'genres': ['Action','Adventure','Family'],
            'tags': ['1080p', 'x264'],
            'runtime': 97
        },
        {
            'thumbnail': 'static/MV5BODcxMzY3ODY1NF5BMl5BanBnXkFtZTgwNzg1NDY4MTE@._V1_SX214_AL_.jpg',
            'title': 'Lucy',
            'year': 2014,
            'imdbRating': 6.6,
            'genres': ['Action','Sci-Fi'],
            'tags': ['1080p', 'x264'],
            'runtime': 89
        },
        {
            'thumbnail': 'static/MV5BMTc1MjQ3ODAyOV5BMl5BanBnXkFtZTgwNjI1NDQ0MTE@._V1_SX214_AL_.jpg',
            'title': 'Transcendence',
            'year': 2014,
            'imdbRating': 6.4,
            'genres': ['Drama','Mystery','Sci-Fi'],
            'tags': ['1080p', 'x264'],
            'runtime': 119
        },
        {
            'thumbnail': 'static/MV5BMjAwMzAzMzExOF5BMl5BanBnXkFtZTgwOTcwMDA5MTE@._V1_SX214_AL_.jpg',
            'title': 'Maleficent',
            'year': 2014,
            'imdbRating': 7.4,
            'genres': ['Action','Adventure','Family'],
            'tags': ['1080p', 'x264'],
            'runtime': 97
        },
        {
            'thumbnail': 'static/MV5BODcxMzY3ODY1NF5BMl5BanBnXkFtZTgwNzg1NDY4MTE@._V1_SX214_AL_.jpg',
            'title': 'Lucy',
            'year': 2014,
            'imdbRating': 6.6,
            'genres': ['Action','Sci-Fi'],
            'tags': ['1080p', 'x264'],
            'runtime': 89
        },
        {
            'thumbnail': 'static/MV5BMTc1MjQ3ODAyOV5BMl5BanBnXkFtZTgwNjI1NDQ0MTE@._V1_SX214_AL_.jpg',
            'title': 'Transcendence',
            'year': 2014,
            'imdbRating': 6.4,
            'genres': ['Drama','Mystery','Sci-Fi'],
            'tags': ['1080p', 'x264'],
            'runtime': 119
        },
        {
            'thumbnail': 'static/MV5BMjAwMzAzMzExOF5BMl5BanBnXkFtZTgwOTcwMDA5MTE@._V1_SX214_AL_.jpg',
            'title': 'Maleficent',
            'year': 2014,
            'imdbRating': 7.4,
            'genres': ['Action','Adventure','Family'],
            'tags': ['1080p', 'x264'],
            'runtime': 97
        },
        {
            'thumbnail': 'static/MV5BODcxMzY3ODY1NF5BMl5BanBnXkFtZTgwNzg1NDY4MTE@._V1_SX214_AL_.jpg',
            'title': 'Lucy',
            'year': 2014,
            'imdbRating': 6.6,
            'genres': ['Action','Sci-Fi'],
            'tags': ['1080p', 'x264'],
            'runtime': 89
        },
        {
            'thumbnail': 'static/MV5BMTc1MjQ3ODAyOV5BMl5BanBnXkFtZTgwNjI1NDQ0MTE@._V1_SX214_AL_.jpg',
            'title': 'Transcendence',
            'year': 2014,
            'imdbRating': 6.4,
            'genres': ['Drama','Mystery','Sci-Fi'],
            'tags': ['1080p', 'x264'],
            'runtime': 119
        },
        {
            'thumbnail': 'static/MV5BMjAwMzAzMzExOF5BMl5BanBnXkFtZTgwOTcwMDA5MTE@._V1_SX214_AL_.jpg',
            'title': 'Maleficent',
            'year': 2014,
            'imdbRating': 7.4,
            'genres': ['Action','Adventure','Family'],
            'tags': ['1080p', 'x264'],
            'runtime': 97
        },
        {
            'thumbnail': 'static/MV5BODcxMzY3ODY1NF5BMl5BanBnXkFtZTgwNzg1NDY4MTE@._V1_SX214_AL_.jpg',
            'title': 'Lucy',
            'year': 2014,
            'imdbRating': 6.6,
            'genres': ['Action','Sci-Fi'],
            'tags': ['1080p', 'x264'],
            'runtime': 89
        }
    ];
});