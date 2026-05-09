import { Spinner } from 'react-bootstrap';

export default function Loader() {
  return (
    <Spinner animation="border" role="status" className="d-block mx-auto my-4">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  );
}
