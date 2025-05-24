'use client';

import { useGetUsersQuery } from '../../lib/redux/api/apiSlice';
import Navbar from '../../components/Navbar';

export default function UsersPage() {
  const { data, error, isLoading } = useGetUsersQuery();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading users</p>;

  return (
    <div>
      <Navbar />
      <h1>Users</h1>
      <ul>
        {data?.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
