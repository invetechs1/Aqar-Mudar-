import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatSAR } from "@/lib/format";
import { InvestForm } from "@/components/InvestForm";
import { isStripeConfigured } from "@/lib/stripe";
import { isMoyasarConfigured } from "@/lib/moyasar";
import { getDictionary, getLocale } from "@/lib/i18n";

export default async function InvestPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/auth/signin?callbackUrl=/properties/${params.id}/invest`);
  }

  const locale = getLocale();
  const dict = getDictionary(locale);
  const t = dict.invest.page;

  const property = await prisma.property.findUnique({ where: { id: params.id } });
  if (!property) notFound();

  if (
    property.listingType !== "PARTIAL_SALE" ||
    !property.totalShares ||
    !property.sharePriceSAR
  ) {
    redirect(`/properties/${params.id}`);
  }

  const remaining = property.totalShares - property.soldShares;
  const soldPct = Math.round((property.soldShares / property.totalShares) * 100);
  const moyasarAvailable = isMoyasarConfigured();
  const stripeAvailable = isStripeConfigured();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6">
        <div className="text-sm text-slate-500">{t.eyebrow}</div>
        <h1 className="text-2xl font-bold">{property.title}</h1>
      </div>

      <div className="card p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs text-slate-500 mb-1">{t.sharePrice}</div>
            <div className="font-bold">{formatSAR(property.sharePriceSAR, locale)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">{t.totalShares}</div>
            <div className="font-bold">{property.totalShares}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">{t.availableShares}</div>
            <div className="font-bold text-brand-700">{remaining}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">{t.totalValue}</div>
            <div className="font-bold">{formatSAR(property.price, locale)}</div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>{t.soldLabel}</span>
            <span>{soldPct}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-brand-600" style={{ width: `${soldPct}%` }} />
          </div>
        </div>
      </div>

      {!moyasarAvailable && !stripeAvailable && (
        <div className="card p-4 mb-4 bg-amber-50 border-amber-200 text-sm text-amber-800">
          ⚠️ {t.noGatewayWarning} <code>MOYASAR_SECRET_KEY</code>{" "}
          {t.noGatewayOr} <code>STRIPE_SECRET_KEY</code> {t.noGatewaySuffix} <code>.env</code>.
        </div>
      )}

      <InvestForm
        dict={t}
        locale={locale}
        propertyId={property.id}
        sharePrice={property.sharePriceSAR}
        maxShares={remaining}
        moyasarAvailable={moyasarAvailable}
        stripeAvailable={stripeAvailable}
      />
    </div>
  );
}
