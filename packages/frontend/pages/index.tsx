import withApollo from '../lib/with-apollo';
import Link from 'next/link';
import { useUsersQuery } from '../types/graphql';
const Index = () => {
  const { data, loading } = useUsersQuery();
  console.log(data);
  return (
    <div>
      <Link href="/about">
        <a>static</a>
      </Link>{' '}
      page.
      <div>
        {loading && <div>Loading</div>}
        {data?.users?.map(user => (
          <div key={user.id}>{user.username}</div>
        ))}
      </div>
    </div>
  );
};

export default withApollo(Index);
