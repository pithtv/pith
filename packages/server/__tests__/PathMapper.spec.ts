import {mapPath} from "../src/lib/PathMapper";
import {expect, test} from '@jest/globals';

test("Path mapping with match", () => {
  expect(mapPath("/movies/Something (2022)/movie.mkv", [
    {remotePath: "/movies", localPath: "/media/Movies"},
    {remotePath: "/tv", localPath: "/media/Shows"}]))
  .toBe("/media/Movies/Something (2022)/movie.mkv");
});

test("Path mapping without match", () => {
  expect(mapPath("/movies/Something (2022)/movie.mkv", [
    {remotePath: "/moxies", localPath: "/media/Movies"},
    {remotePath: "/tv", localPath: "/media/Shows"}]))
  .toBe("/movies/Something (2022)/movie.mkv");
});

test("Path mapping without mappings", () => {
  expect(mapPath("/movies/Something (2022)/movie.mkv", null)).toBe("/movies/Something (2022)/movie.mkv");
});
