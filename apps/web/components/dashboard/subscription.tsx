"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Switch } from "@repo/ui/components/ui/switch";
import { Label } from "@repo/ui/components/ui/label";
import { Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { useCurrency } from "@/hooks/useCurrency";
import { getCheckout } from "@/lib/paymentUtils";
import { toast } from "@repo/ui/components/ui/sonner";

export const currencySymbols = {
  USD: '$',
  PHP: '₱',
};

export function Subscription() {
  const { currency } = useCurrency();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);

  const features = [
    {
      name: "Monthly Tokens",
      free: "2 tokens",
      pro: "20 tokens",
      unlimited: "Unlimited tokens"
    },
    {
      name: "Client Limit",
      free: "1 active client",
      pro: "Up to 10 clients",
      unlimited: "Unlimited clients"
    },
    {
      name: "Freelancer Profile",
      free: "Basic",
      pro: "Highlighted",
      unlimited: "Top-tier placement"
    },
    {
      name: "Support",
      free: "Community",
      pro: "Priority Email",
      unlimited: "VIP 24/7 Phone & Email"
    },
    {
      name: "Analytics",
      free: null,
      pro: "Enhanced + Engagement Stats",
      unlimited: "Advanced + Conversion Reports"
    },
    {
      name: "Job Matching",
      free: null,
      pro: "Curated Recommendations",
      unlimited: "Access to Premium Projects"
    },
    {
      name: "New Feature Access",
      free: null,
      pro: "Early Access",
      unlimited: "Early Access"
    },
    {
      name: "Profile Badges",
      free: null,
      pro: "Trusted Freelancer Badge",
      unlimited: "Verified & Premium Badges"
    },
    {
      name: "API & Workflow Integrations",
      free: null,
      pro: null,
      unlimited: true
    },
    {
      name: "Custom Workflows",
      free: null,
      pro: null,
      unlimited: true
    },
    {
      name: "Custom Domains",
      free: null,
      pro: null,
      unlimited: true
    },
    {
      name: "Collaboration Tools",
      free: null,
      pro: null,
      unlimited: "Invite Assistants"
    },
    {
      name: "Dedicated Account Manager",
      free: null,
      pro: null,
      unlimited: true
    },
    {
      name: "Client Satisfaction Insights",
      free: null,
      pro: null,
      unlimited: true
    },
    {
      name: "Revisions on Profile",
      free: null,
      pro: null,
      unlimited: "Unlimited Revisions"
    }
  ];

  const plans = [
    {
      name: "Free",
      description: "Essential features for individuals and small projects",
      price: {
        monthly: 0,
        annual: 0,
      },
      features: [
        "2 client tokens per month",
        "Limited to 2 active client at a time",
        "Access to basic freelancer profile",
        "Community support"
      ],
      cta: "Get Started",
      popular: false,
      priceId: "",
    },
    {
      name: "Pro",
      description: "Advanced features for professionals and growing teams",
      price: {
        monthly: currency === 'USD' ? 899 : 49900,
        annual: currency === 'USD' ? 8899 : 503000,
      },
      features: [
        "20 client tokens per month",
        "Accept up to 20 clients",
        "Highlighted profile for increased visibility",
        "Access to priority support",
        "Enhanced analytics",
        "Insights on top-performing services",
        "Client engagement statistics",
        "Early access to new features",
        "Profile badge for trusted freelancers",
        "Access to curated job recommendations"
      ],
      cta: "Upgrade to Pro",
      popular: true,
      priceId: isAnnual
        ? (currency === 'USD' ? "price_1RDn7cAeksyXSt98eVTbN4vP" : "price_1RDmaHAeksyXSt98dNdTXCpM")
        : (currency === 'USD' ? "price_1RDnGMAeksyXSt98iFNGNVWA" : "price_1RDmYeAeksyXSt98Vb9O9XX2"),
    },
    {
      name: "Unlimited",
      description: "Enterprise-grade features for large teams and organizations",
      price: {
        monthly: currency === 'USD' ? 1899 : 99900,
        annual: currency === 'USD' ? 17699 : 1007000,
      },
      features: [
        "Unlimited tokens",
        "Accept unlimited clients",
        "Top-tier profile placement",
        "Access to premium projects",
        "API integrations and custom workflows",
        "VIP support",
        "Dedicated account manager",
        "Priority access to high-budget clients",
        "Unlimited revisions on profile content",
        "Client satisfaction tracking tools",
        "Advanced performance and conversion reports",
        "Team collaboration tools (invite assistants)"
      ],
      cta: "Upgrade Now",
      popular: false,
      priceId: isAnnual
        ? (currency === 'USD' ? "price_1RDnxlAeksyXSt980Ws6ZjKC" : "price_1RDnxQAeksyXSt98VN0pg1AE")
        : (currency === 'USD' ? "price_1RDnwTAeksyXSt98AePy9zVY" : "price_1RDnvfAeksyXSt98H2uiACGo"),
    },
  ];

  const handleCheckout = async (priceId: string, planName: string) => {
    if (!priceId) {
      window.location.href = "/dashboard/all-posts";
      return;
    }

    setLoadingPlan(planName);

    try {
      const url: string | null = await getCheckout({
        priceId
      });

      if (!url) {
        toast.error('Something went wrong. Please try again later.');
        return;
      }
      window.location.href = url;
    } catch (error) {
      toast.error('Something went wrong. Please try again later.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const formatPrice = (amount: number) => {
    const formattedAmount = (amount / 100).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return `${currencySymbols[currency as keyof typeof currencySymbols]}${formattedAmount}`;
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-28">
        <div className="space-y-12">
          <p className="font-medium text-lg text-yellow-500">Upgrade Your Plan</p>
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-4xl">{`Serious about freelancing? Two clients a month won't cut it`}</h1>
            <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
              Select the perfect plan for your needs. Upgrade or downgrade at any time.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center mt-8">
          <Label htmlFor="billing-toggle" className="mr-2">
            Monthly
          </Label>
          <Switch id="billing-toggle" checked={isAnnual} onCheckedChange={setIsAnnual} />
          <Label htmlFor="billing-toggle" className="ml-2">
            Annual <span className="text-sm text-emerald-600 font-medium">(Save 16%)</span>
          </Label>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card key={plan.name} className={`flex flex-col border-2 rounded-2xl p-4 ${plan.popular ? "border-yellow-500 shadow-lg relative" : ""}`}>
            {plan.popular && (
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4">
                <span className="bg-yellow-500 text-primary-foreground flex items-center justify-center gap-2 text-xs font-medium px-2 py-2 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                  Most Popular
                </span>
              </div>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mb-6">
                {(plan.price.monthly === 0 && plan.price.annual === 0) ? (
                  <span className="text-4xl font-bold">Free</span>
                ) : (
                  <span className="text-4xl font-bold">{isAnnual ? formatPrice(plan.price.annual) : formatPrice(plan.price.monthly)}</span>
                )}
                {plan.price.monthly > 0 && (
                  <span className="text-muted-foreground ml-1">/{isAnnual ? "year" : "month"}</span>
                )}
                {isAnnual && plan.price.monthly > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">{formatPrice(plan.price.monthly)}/mo when billed monthly</p>
                )}
              </div>
              <ul className="space-y-5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleCheckout(plan.priceId, plan.name)}
                className={`w-full rounded-lg py-6 text-base font-medium ${plan.popular ? "bg-yellow-500 hover:bg-yellow-500/90" : ""}`}
                variant={plan.popular ? "default" : "outline"}
                disabled={loadingPlan === plan.name}
              >
                {loadingPlan === plan.name ? "Processing..." : plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-28 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Compare Plans</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4 px-4">Features</th>
                <th className="text-center py-4 px-4">Free</th>
                <th className="text-center py-4 px-4">Pro</th>
                <th className="text-center py-4 px-4">Unlimited</th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr key={index} className="border-b">
                  <td className="py-3 px-4">{feature.name}</td>
                  <td className="text-center py-3 px-4">
                    {feature.free ? (
                      <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                    ) : feature.free === null ? (
                      "–"
                    ) : (
                      feature.free
                    )}
                  </td>
                  <td className="text-center py-3 px-4">
                    {feature.pro ? (
                      <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                    ) : feature.pro === null ? (
                      "–"
                    ) : (
                      feature.pro
                    )}
                  </td>
                  <td className="text-center py-3 px-4">
                    {feature.unlimited === true ? (
                      <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                    ) : feature.unlimited === null ? (
                      "–"
                    ) : (
                      feature.unlimited
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-28 text-center">
        <h2 className="text-2xl font-bold mb-4">Need something custom?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          {`Contact our sales team for a custom plan tailored to your organization's specific needs.`}
        </p>
      </div>
    </div>
  );
}

export const SubscriptionPageSkeleton = () => {
  return (
    <div className="container mx-auto py-12 px-4">
      {/* Header Section Skeleton */}
      <div className="text-center mb-28">
        <div className="space-y-12">
          {/* Category label skeleton */}
          <div className="h-6 w-36 bg-gray-200 rounded-md mx-auto animate-pulse" />

          {/* Title skeleton */}
          <div className="space-y-4">
            <div className="h-10 w-3/4 bg-gray-200 rounded-md mx-auto animate-pulse" />
            {/* Description skeleton */}
            <div className="h-6 w-2/3 bg-gray-200 rounded-md mx-auto mt-4 animate-pulse" />
          </div>
        </div>

        {/* Toggle skeleton */}
        <div className="flex items-center justify-center mt-8">
          <div className="h-5 w-16 bg-gray-200 rounded-md animate-pulse" />
          <div className="h-6 w-10 bg-gray-300 rounded-full mx-2 animate-pulse" />
          <div className="h-5 w-24 bg-gray-200 rounded-md animate-pulse" />
        </div>
      </div>

      {/* Pricing Cards Skeleton */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Card 1 */}
        <div className="border-2 border-gray-200 rounded-2xl p-4 animate-pulse">
          <div className="py-6 px-2">
            <div className="h-7 w-1/3 bg-gray-200 rounded-md mb-2" />
            <div className="h-5 w-2/3 bg-gray-200 rounded-md" />
          </div>
          <div className="px-2 pb-6">
            <div className="h-10 w-1/2 bg-gray-200 rounded-md mb-6" />
            {/* Feature list skeleton */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center mb-5">
                <div className="h-4 w-4 bg-gray-300 rounded-full mr-2" />
                <div className="h-4 w-3/4 bg-gray-200 rounded-md" />
              </div>
            ))}
          </div>
          <div className="px-2 pt-4">
            <div className="h-12 w-full bg-gray-200 rounded-lg" />
          </div>
        </div>

        {/* Card 2 - Featured */}
        <div className="border-2 border-gray-300 rounded-2xl p-4 shadow-md relative animate-pulse">
          {/* Popular badge skeleton */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4">
            <div className="h-8 w-24 bg-gray-300 rounded-lg" />
          </div>
          <div className="py-6 px-2">
            <div className="h-7 w-1/3 bg-gray-200 rounded-md mb-2" />
            <div className="h-5 w-2/3 bg-gray-200 rounded-md" />
          </div>
          <div className="px-2 pb-6">
            <div className="h-10 w-1/2 bg-gray-200 rounded-md mb-6" />
            {/* Feature list skeleton */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center mb-5">
                <div className="h-4 w-4 bg-gray-300 rounded-full mr-2" />
                <div className="h-4 w-3/4 bg-gray-200 rounded-md" />
              </div>
            ))}
          </div>
          <div className="px-2 pt-4">
            <div className="h-12 w-full bg-gray-300 rounded-lg" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="border-2 border-gray-200 rounded-2xl p-4 animate-pulse">
          <div className="py-6 px-2">
            <div className="h-7 w-1/3 bg-gray-200 rounded-md mb-2" />
            <div className="h-5 w-2/3 bg-gray-200 rounded-md" />
          </div>
          <div className="px-2 pb-6">
            <div className="h-10 w-1/2 bg-gray-200 rounded-md mb-6" />
            {/* Feature list skeleton */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center mb-5">
                <div className="h-4 w-4 bg-gray-300 rounded-full mr-2" />
                <div className="h-4 w-3/4 bg-gray-200 rounded-md" />
              </div>
            ))}
          </div>
          <div className="px-2 pt-4">
            <div className="h-12 w-full bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Comparison Table Skeleton */}
      <div className="mt-28 max-w-4xl mx-auto">
        <div className="h-8 w-48 bg-gray-200 rounded-md mx-auto mb-8 animate-pulse" />
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4">
                  <div className="h-6 w-24 bg-gray-200 rounded-md animate-pulse" />
                </th>
                <th className="text-center py-4 px-4">
                  <div className="h-6 w-16 bg-gray-200 rounded-md mx-auto animate-pulse" />
                </th>
                <th className="text-center py-4 px-4">
                  <div className="h-6 w-16 bg-gray-200 rounded-md mx-auto animate-pulse" />
                </th>
                <th className="text-center py-4 px-4">
                  <div className="h-6 w-24 bg-gray-200 rounded-md mx-auto animate-pulse" />
                </th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
                <tr key={row} className="border-b border-gray-200">
                  <td className="py-3 px-4">
                    <div className="h-5 w-32 bg-gray-200 rounded-md animate-pulse" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="h-4 w-4 bg-gray-300 rounded-full mx-auto animate-pulse" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="h-4 w-4 bg-gray-300 rounded-full mx-auto animate-pulse" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="h-4 w-4 bg-gray-300 rounded-full mx-auto animate-pulse" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer CTA Skeleton */}
      <div className="mt-28 text-center">
        <div className="h-8 w-64 bg-gray-200 rounded-md mx-auto mb-4 animate-pulse" />
        <div className="h-6 w-2/3 bg-gray-200 rounded-md mx-auto mb-6 animate-pulse" />
      </div>
    </div>
  );
};
