import gql from 'graphql-tag';

export const userFragment = gql`
  fragment userFragment on User {
    id
    username
  }
`;
