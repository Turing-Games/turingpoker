import CardLoader from "./Loader";

export default function ConnectionFailed() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      flex: 1
    }}>
      <h2>Game does not exist or connection failed</h2>
      <CardLoader />
    </div>
  );
}