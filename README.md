# Source Code for PatrickDesjardins.com
## Context

This website contains an introduction about Patrick Desjardins and a migration of all WordPress blog from 2011 that was hosted in a personal VPS.

## Technical Details

1. The platform for the _about_ and _blog_ is Gatsby version 3
2. The blog articles are written in the MDX format
3. Code blocs are rendered with PrismJS

## Decisions

1. Blog articles are under the `blog` folder, then the year of creation. Each year needs to have an image folder. To have the image deployed we need to ensure that in the `gatsby-config.js` an entry for each `blog/20xx`
2. To have the website having the pattern: `patrickdesjardins.com/blog/slug-here-for-blog`, there is a custom `slug` field created in `gastby-node.js` and then a function that associate the MDX to the slug. 

## Deployments

The website is hosted in a Github repository. The _master_ branch host the Gatsby project and the _gh-pages_ is where the build files are deployed.
The website is deployed using Github Workflow. It has a hook on when a code is pushed in the _master_ branch. You can see the workflow's action configuration in the repository [here](https://github.com/MrDesjardins/patrickdesjardins/blob/master/.github/workflows/main.yml).

## Todos

1. Animated gif are not rendered
2. MP4 videos are not rendered
3. Year + Month list with count of blog
4. Pagination on the all blog pages
5. Migrate CSS to Styled Component (or something inside the React component)