import gql from 'graphql-tag';
import { userFragment } from '../fragment/userFragment';
export const USER_QUERY = gql`
  query User($id: ID!) {
    user(id: $id) {
      ...userFragment
    }
  }
  ${userFragment}
`;
