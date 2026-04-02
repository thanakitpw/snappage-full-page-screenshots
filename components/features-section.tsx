"use client";

import { Maximize, Monitor, Tablet, Smartphone, Search } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useLanguage } from "@/components/language-context";

export function FeaturesSection() {
  const { t } = useLanguage();

  const features = [
    {
      icon: <Maximize className="size-8 text-[#3B82F6]" />,
      title: t("feature1Title"),
      desc: t("feature1Desc"),
    },
    {
      icon: (
        <div className="flex items-center gap-1 text-[#3B82F6]">
          <Monitor className="size-6" />
          <Tablet className="size-5" />
          <Smartphone className="size-4" />
        </div>
      ),
      title: t("feature2Title"),
      desc: t("feature2Desc"),
    },
    {
      icon: <Search className="size-8 text-[#3B82F6]" />,
      title: t("feature3Title"),
      desc: t("feature3Desc"),
    },
  ];

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-16">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="bg-white">
            <CardHeader>
              <div className="mb-2">{feature.icon}</div>
              <CardTitle className="text-[#1E293B]">{feature.title}</CardTitle>
              <CardDescription>{feature.desc}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
