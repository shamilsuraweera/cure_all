import { LinkButton } from "../components/ui/button";
import { Card } from "../components/ui/card";

export const NotFoundPage = () => (
  <Card title="Lost in the ward?" eyebrow="404">
    <p>We couldn't find that page. Head back to the overview.</p>
    <div className="mt-4">
      <LinkButton to="/" variant="outline">
        Go to overview
      </LinkButton>
    </div>
  </Card>
);
