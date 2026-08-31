import { Suspense } from "react";
import { RequestQuoteForm } from "./request-quote-form";

export default function RequestQuotePage() {
  return (
    <Suspense
      fallback={
        <div className="section-padding bg-bg-primary-light text-center">
          <div className="container-mvm">
            <div className="animate-spin h-6 w-6 border-2 border-accent border-t-transparent rounded-full mx-auto" />
          </div>
        </div>
      }
    >
      <RequestQuoteForm />
    </Suspense>
  );
}
