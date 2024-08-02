import React, { useEffect } from "react";
import { useFetchData } from "../api";
import { useSetAppState } from "../hooks/useAppStore";

const TestComponent: React.FC = () => {
  const { data, error, isLoading } = useFetchData(
    "https://dummyjson.com/users"
  );
  const setAppState = useSetAppState();

  useEffect(() => {
    if (data) {
      setAppState(data.users[0].firstName);
    }
  }, [data, setAppState]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return <div>Data loaded: {data.users[0].firstName}</div>;
};

export default TestComponent;
