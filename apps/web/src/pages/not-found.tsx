import { Link } from "react-router-dom";

import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

export const NotFoundPage = () => (
  <Card title="Lost in the ward?" eyebrow="404">
    <p>This route is not available yet. Head back to the overview.</p>
    <div className="mt-4">
      <Link to="/">
        <Button variant="outline">Go to overview</Button>
      </Link>
    </div>
  </Card>
);
