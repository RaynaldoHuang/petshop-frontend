/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Check,
  ChevronDown,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  MapPin,
  Phone,
  Search,
  ShoppingBag,
  Truck,
  UserRound,
} from "lucide-react";

import { apiFetch } from "@/lib/api";
import { getCart } from "@/lib/cart";
import { getStorageUrl } from "@/lib/storage";
import { CartItem } from "@/types/cart";

type PaymentMethod = {
  id: number;
  name: string;
  code: string;
  type: string;
  fee: number;
  fee_percentage: number;
};

type Province = {
  province_id: string;
  province: string;
};

type City = {
  city_id: string;
  province_id: string;
  province: string;
  type: string;
  city_name: string;
  postal_code: string;
};

type District = {
  district_id: string;
  city_id: string;
  district_name: string;
};

type SubDistrict = {
  subdistrict_id: string;
  destination_id: string;
  district_id: string;
  subdistrict_name: string;
  zip_code: string;
};

type ShippingCourier = {
  code: string;
  name: string;
};

type ShippingCostOption = {
  courier_code: string;
  courier_name: string;
  service: string;
  description: string;
  cost: {
    value: number;
    etd: string;
    note: string;
  }[];
};

type SelectOption = {
  value: string;
  label: string;
};

function getImageUrl(image: string | null) {
  if (!image || image.trim() === "" || image.trim() === "0") {
    return "/pet-placeholder.jpg";
  }

  return image.startsWith("http") ? image : getStorageUrl(image);
}

function currency(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function hasAuthToken() {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(
    localStorage.getItem("token") || sessionStorage.getItem("token"),
  );
}

export default function CheckoutPage() {
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [subDistricts, setSubDistricts] = useState<SubDistrict[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [selectedSubDistrictId, setSelectedSubDistrictId] = useState("");
  const [activeCouriers, setActiveCouriers] = useState<ShippingCourier[]>([]);
  const [shippingOptions, setShippingOptions] = useState<ShippingCostOption[]>([]);
  const [selectedShippingOption, setSelectedShippingOption] =
    useState<ShippingCostOption | null>(null);
  const [shippingWeight, setShippingWeight] = useState(0);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [openDropdown, setOpenDropdown] = useState<
    "province" | "city" | "district" | "subdistrict" | null
  >(null);
  const [provinceSearch, setProvinceSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  const [subDistrictSearch, setSubDistrictSearch] = useState("");
  const [openShippingCourier, setOpenShippingCourier] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setCartItems(getCart());
  }, []);

  useEffect(() => {
    async function fetchProvinces() {
      try {
        const res = await apiFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/shipping/provinces`,
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Gagal memuat provinsi");
        }

        setProvinces(data);
      } catch (err) {
        setShippingError(
          err instanceof Error ? err.message : "Gagal memuat provinsi",
        );
      }
    }

    fetchProvinces();
  }, []);

  useEffect(() => {
    async function fetchShippingConfig() {
      try {
        const res = await apiFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/shipping/config`,
        );
        const data = await res.json();

        if (res.ok) {
          setActiveCouriers(data.active_couriers || []);
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchShippingConfig();
  }, []);

  useEffect(() => {
    async function fetchCities() {
      if (!selectedProvinceId) {
        setCities([]);
        setSelectedCityId("");
        setDistricts([]);
        setSubDistricts([]);
        setSelectedDistrictId("");
        setSelectedSubDistrictId("");
        return;
      }

      try {
        setShippingError("");
        setSelectedCityId("");
        setDistricts([]);
        setSubDistricts([]);
        setSelectedDistrictId("");
        setSelectedSubDistrictId("");
        setShippingOptions([]);
        setSelectedShippingOption(null);

        const res = await apiFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/shipping/cities?province_id=${selectedProvinceId}`,
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Gagal memuat kota");
        }

        setCities(data);
      } catch (err) {
        setShippingError(err instanceof Error ? err.message : "Gagal memuat kota");
      }
    }

    fetchCities();
  }, [selectedProvinceId]);

  useEffect(() => {
    async function fetchDistricts() {
      if (!selectedCityId) {
        setDistricts([]);
        setSubDistricts([]);
        setSelectedDistrictId("");
        setSelectedSubDistrictId("");
        return;
      }

      try {
        setShippingError("");
        setDistricts([]);
        setSubDistricts([]);
        setSelectedDistrictId("");
        setSelectedSubDistrictId("");
        setShippingOptions([]);
        setSelectedShippingOption(null);

        const res = await apiFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/shipping/districts?city_id=${selectedCityId}`,
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Gagal memuat kecamatan");
        }

        setDistricts(data);
      } catch (err) {
        setShippingError(
          err instanceof Error ? err.message : "Gagal memuat kecamatan",
        );
      }
    }

    fetchDistricts();
  }, [selectedCityId]);

  useEffect(() => {
    async function fetchSubDistricts() {
      if (!selectedDistrictId) {
        setSubDistricts([]);
        setSelectedSubDistrictId("");
        return;
      }

      try {
        setShippingError("");
        setSubDistricts([]);
        setSelectedSubDistrictId("");
        setShippingOptions([]);
        setSelectedShippingOption(null);

        const res = await apiFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/shipping/sub-districts?district_id=${selectedDistrictId}`,
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Gagal memuat kelurahan");
        }

        setSubDistricts(data);
      } catch (err) {
        setShippingError(
          err instanceof Error ? err.message : "Gagal memuat kelurahan",
        );
      }
    }

    fetchSubDistricts();
  }, [selectedDistrictId]);

  useEffect(() => {
    async function fetchShippingCosts() {
      const selectedDestination = subDistricts.find(
        (item) => item.subdistrict_id === selectedSubDistrictId,
      );

      if (
        !selectedDestination ||
        activeCouriers.length === 0 ||
        cartItems.length === 0
      ) {
        setShippingOptions([]);
        setSelectedShippingOption(null);
        return;
      }

      try {
        setShippingLoading(true);
        setShippingError("");
        setShippingOptions([]);
        setSelectedShippingOption(null);

        const responses = await Promise.all(
          activeCouriers.map(async (courier) => {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/shipping/costs`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
                destination: selectedDestination.destination_id,
                courier: courier.code,
              items: cartItems.map((item) => ({
                id: item.id,
                quantity: item.quantity,
              })),
            }),
            });

            const data = await res.json();

            if (!res.ok) {
              throw new Error(data.message || `Gagal menghitung ongkir ${courier.name}`);
            }

            return {
              courier,
              data,
            };
          }),
        );

        const options = responses.flatMap(({ courier, data }) =>
          (data.results?.[0]?.costs || []).map((option: ShippingCostOption) => ({
            ...option,
            courier_code: courier.code,
            courier_name: courier.name,
          })),
        );

        setShippingWeight(responses[0]?.data?.weight || 0);
        setShippingOptions(options);
        setSelectedShippingOption(options[0] || null);
        setOpenShippingCourier(options[0]?.courier_code || null);
      } catch (err) {
        setShippingError(
          err instanceof Error ? err.message : "Gagal menghitung ongkir",
        );
      } finally {
        setShippingLoading(false);
      }
    }

    fetchShippingCosts();
  }, [activeCouriers, cartItems, selectedSubDistrictId, subDistricts]);

  useEffect(() => {
    async function fetchPaymentMethods() {
      try {
        const res = await apiFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/payment-methods`,
        );
        const data = await res.json();

        setPaymentMethods(data);

        if (data.length > 0) {
          setSelectedPayment(data[0]);
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchPaymentMethods();
  }, []);

  const subtotalPrice = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]);

  const selectedShippingCost = selectedShippingOption?.cost?.[0]?.value || 0;
  const adminFeeBase = subtotalPrice + selectedShippingCost;
  const fixedAdminFee = selectedPayment?.fee || 0;
  const percentageAdminFee = Math.round(
    adminFeeBase * ((selectedPayment?.fee_percentage || 0) / 100),
  );
  const adminFee = fixedAdminFee + percentageAdminFee;
  const adminFeeTax = Math.round(adminFee * 0.11);
  const totalPrice = subtotalPrice + selectedShippingCost + adminFee + adminFeeTax;

  const selectedProvince = provinces.find(
    (province) => province.province_id === selectedProvinceId,
  );

  const selectedCity = cities.find((city) => city.city_id === selectedCityId);
  const selectedDistrict = districts.find(
    (district) => district.district_id === selectedDistrictId,
  );
  const selectedSubDistrict = subDistricts.find(
    (subDistrict) => subDistrict.subdistrict_id === selectedSubDistrictId,
  );

  const provinceOptions = provinces.map((province) => ({
    value: province.province_id,
    label: province.province,
  }));

  const cityOptions = cities.map((city) => ({
    value: city.city_id,
    label: `${city.type} ${city.city_name}`,
  }));

  const districtOptions = districts.map((district) => ({
    value: district.district_id,
    label: district.district_name,
  }));

  const subDistrictOptions = subDistricts.map((subDistrict) => ({
    value: subDistrict.subdistrict_id,
    label: `${subDistrict.subdistrict_name} - ${subDistrict.zip_code}`,
  }));

  const shippingGroups = useMemo(() => {
    const grouped = new Map<
      string,
      {
        code: string;
        name: string;
        options: ShippingCostOption[];
      }
    >();

    shippingOptions.forEach((option) => {
      const key = option.courier_code;
      const group = grouped.get(key) || {
        code: option.courier_code,
        name: option.courier_name,
        options: [],
      };

      group.options.push(option);
      grouped.set(key, group);
    });

    return Array.from(grouped.values());
  }, [shippingOptions]);

  useEffect(() => {
    if (shippingGroups.length === 0) {
      setOpenShippingCourier(null);
      return;
    }

    const stillExists = shippingGroups.some(
      (group) => group.code === openShippingCourier,
    );

    if (!stillExists) {
      setOpenShippingCourier(shippingGroups[0].code);
    }
  }, [openShippingCourier, shippingGroups]);

  const canSubmit =
    !loading &&
    Boolean(selectedPayment) &&
    Boolean(selectedCity) &&
    Boolean(selectedDistrict) &&
    Boolean(selectedSubDistrict) &&
    Boolean(selectedShippingOption);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!hasAuthToken()) {
      toast.error("Login atau daftar dulu untuk melanjutkan pembayaran.");

      return;
    }

    if (cartItems.length === 0) {
      setError("Keranjang masih kosong.");
      return;
    }

    if (!selectedCity || !selectedDistrict || !selectedSubDistrict || !selectedShippingOption) {
      setError("Lengkapi tujuan pengiriman dan pilih layanan ongkir.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          shipping_address: shippingAddress,
          shipping_province_id: selectedProvince?.province_id,
          shipping_province: selectedProvince?.province,
          shipping_city_id: selectedCity.city_id,
          shipping_city: `${selectedCity.type} ${selectedCity.city_name}`,
          shipping_destination_id: selectedSubDistrict.destination_id,
          shipping_district_id: selectedDistrict.district_id,
          shipping_district: selectedDistrict.district_name,
          shipping_subdistrict_id: selectedSubDistrict.subdistrict_id,
          shipping_subdistrict: selectedSubDistrict.subdistrict_name,
          shipping_zip_code: selectedSubDistrict.zip_code,
          shipping_courier: selectedShippingOption.courier_code.toUpperCase(),
          shipping_service: selectedShippingOption.service,
          shipping_cost: selectedShippingCost,
          shipping_etd: selectedShippingOption.cost?.[0]?.etd,
          shipping_weight: shippingWeight,
          payment_method: selectedPayment?.code,
          items: cartItems.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Sesi login habis. Login ulang dulu ya.");

          return;
        }

        throw new Error(data.message || "Gagal membuat order");
      }

      const paymentRes = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            order_id: data.data.id,
            payment_method: selectedPayment?.code,
          }),
        },
      );

      const paymentData = await paymentRes.json();

      if (!paymentRes.ok) {
        throw new Error(paymentData.message || "Gagal membuat pembayaran");
      }

      router.push(`/checkout/payment/${data.data.id}?payment=${paymentData.payment_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bg-[#F7F9FC] pb-12 pt-5 lg:pb-16 lg:pt-8">
      <div className="mx-auto max-w-7xl px-4 lg:px-0">
        <div className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-gray-400 lg:mb-6 lg:text-sm">
          <Link href="/" className="transition hover:text-[#19398A]">
            Beranda
          </Link>
          <ChevronRight size={16} className="text-gray-300" />
          <Link href="/cart" className="transition hover:text-[#19398A]">
            Keranjang
          </Link>
          <ChevronRight size={16} className="text-gray-300" />
          <span className="font-medium text-[#19398A]">Checkout</span>
        </div>

        {cartItems.length === 0 ? (
          <div className="grid min-h-[56vh] place-items-center rounded-lg border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
            <div>
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-lg bg-orange-50 text-orange-500">
                <ShoppingBag size={40} />
              </div>
              <h1 className="mt-6 text-2xl font-bold text-[#19398A]">
                Keranjang masih kosong
              </h1>
              <p className="mt-3 text-sm text-gray-500">
                Tambahkan produk terlebih dahulu sebelum checkout.
              </p>
              <Link
                href="/products"
                className="mt-7 inline-flex h-12 items-center justify-center rounded-lg bg-orange-500 px-6 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Mulai Belanja
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
            <form
              id="checkout-form"
              onSubmit={handleSubmit}
              className="order-2 space-y-4 lg:order-1"
            >
              <section className="rounded-lg border border-gray-200 bg-white p-4 lg:p-6">
                <SectionTitle
                  icon={<UserRound size={18} />}
                  title="Penerima"
                  badge="1"
                />

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <Field label="Nama Lengkap" icon={<UserRound size={17} />}>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(event) => setCustomerName(event.target.value)}
                      className={inputClass}
                      placeholder="Nama penerima"
                      required
                    />
                  </Field>

                  <Field label="Nomor HP" icon={<Phone size={17} />}>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(event) => setCustomerPhone(event.target.value)}
                      className={inputClass}
                      placeholder="08xxxxxxxxxx"
                      required
                    />
                  </Field>
                </div>
              </section>

              <section className="rounded-lg border border-gray-200 bg-white p-4 lg:p-6">
                <SectionTitle icon={<MapPin size={18} />} title="Alamat" badge="2" />

                <div className="mt-5 space-y-4">
                  <Field label="Alamat Lengkap">
                    <textarea
                      value={shippingAddress}
                      onChange={(event) => setShippingAddress(event.target.value)}
                      rows={4}
                      className={`${inputClass} h-auto resize-none py-3 leading-6`}
                      placeholder="Nama jalan, nomor rumah, patokan, RT/RW"
                      required
                    />
                  </Field>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Provinsi">
                      <SmartSelect
                        id="province"
                        value={selectedProvinceId}
                        placeholder="Pilih provinsi"
                        options={provinceOptions}
                        open={openDropdown === "province"}
                        search={provinceSearch}
                        onOpenChange={(open) =>
                          setOpenDropdown(open ? "province" : null)
                        }
                        onSearchChange={setProvinceSearch}
                        onChange={(value) => {
                          setSelectedProvinceId(value);
                          setOpenDropdown(null);
                          setProvinceSearch("");
                        }}
                      />
                    </Field>

                    <Field label="Kota/Kabupaten">
                      <SmartSelect
                        id="city"
                        value={selectedCityId}
                        placeholder={
                          selectedProvinceId
                            ? "Pilih kota/kabupaten"
                            : "Pilih provinsi dahulu"
                        }
                        options={cityOptions}
                        open={openDropdown === "city"}
                        search={citySearch}
                        disabled={!selectedProvinceId}
                        onOpenChange={(open) =>
                          setOpenDropdown(open ? "city" : null)
                        }
                        onSearchChange={setCitySearch}
                        onChange={(value) => {
                          setSelectedCityId(value);
                          setOpenDropdown(null);
                          setCitySearch("");
                        }}
                      />
                    </Field>

                    <Field label="Kecamatan">
                      <SmartSelect
                        id="district"
                        value={selectedDistrictId}
                        placeholder={
                          selectedCityId ? "Pilih kecamatan" : "Pilih kota dahulu"
                        }
                        options={districtOptions}
                        open={openDropdown === "district"}
                        search={districtSearch}
                        disabled={!selectedCityId}
                        onOpenChange={(open) =>
                          setOpenDropdown(open ? "district" : null)
                        }
                        onSearchChange={setDistrictSearch}
                        onChange={(value) => {
                          setSelectedDistrictId(value);
                          setOpenDropdown(null);
                          setDistrictSearch("");
                        }}
                      />
                    </Field>

                    <Field label="Kelurahan & Kode Pos">
                      <SmartSelect
                        id="subdistrict"
                        value={selectedSubDistrictId}
                        placeholder={
                          selectedDistrictId
                            ? "Pilih kelurahan/kode pos"
                            : "Pilih kecamatan dahulu"
                        }
                        options={subDistrictOptions}
                        open={openDropdown === "subdistrict"}
                        search={subDistrictSearch}
                        disabled={!selectedDistrictId}
                        onOpenChange={(open) =>
                          setOpenDropdown(open ? "subdistrict" : null)
                        }
                        onSearchChange={setSubDistrictSearch}
                        onChange={(value) => {
                          setSelectedSubDistrictId(value);
                          setOpenDropdown(null);
                          setSubDistrictSearch("");
                        }}
                      />
                    </Field>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-gray-200 bg-white p-4 lg:p-6">
                <SectionTitle icon={<Truck size={18} />} title="Pengiriman" badge="3" />

                <div className="mt-5">
                  {shippingWeight > 0 ? (
                    <p className="mb-3 text-xs font-semibold text-gray-500">
                      Total berat pengiriman: {shippingWeight.toLocaleString("id-ID")} gram
                    </p>
                  ) : null}

                  <div>
                    {shippingLoading ? (
                      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-500">
                        Mengambil semua opsi pengiriman aktif...
                      </div>
                    ) : shippingGroups.length > 0 ? (
                      <div className="space-y-4">
                        {shippingGroups.map((group) => (
                          <div key={group.code} className="overflow-hidden rounded-lg border border-gray-200">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenShippingCourier((current) =>
                                  current === group.code ? null : group.code,
                                )
                              }
                              className="flex w-full items-center justify-between gap-3 border-b border-gray-100 bg-gray-50 px-4 py-3 text-left transition hover:bg-gray-100"
                            >
                              <div>
                                <p className="text-sm font-bold text-[#19398A]">
                                  {group.name}
                                </p>
                                <p className="mt-0.5 text-xs uppercase text-gray-500">
                                  {group.code}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="rounded-md bg-white px-2.5 py-1 text-xs font-bold text-gray-500">
                                  {group.options.length} layanan
                                </span>
                                <ChevronDown
                                  size={17}
                                  className={`text-gray-400 transition ${
                                    openShippingCourier === group.code
                                      ? "rotate-180"
                                      : ""
                                  }`}
                                />
                              </div>
                            </button>

                            <div
                              className={`grid gap-3 p-3 md:grid-cols-2 ${
                                openShippingCourier === group.code ? "" : "hidden"
                              }`}
                            >
                              {group.options.map((option) => {
                                const cost = option.cost?.[0];
                                const active =
                                  selectedShippingOption?.courier_code ===
                                    option.courier_code &&
                                  selectedShippingOption?.service === option.service;

                                return (
                                  <button
                                    type="button"
                                    key={`${option.courier_code}-${option.service}`}
                                    onClick={() => {
                                      setSelectedShippingOption(option);
                                      setOpenShippingCourier(option.courier_code);
                                    }}
                                    className={`rounded-md border p-3 text-left transition ${
                                      active
                                        ? "border-orange-500 bg-orange-50"
                                        : "border-gray-100 bg-white hover:border-orange-200"
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="min-w-0">
                                        <p className="text-sm font-bold text-[#19398A]">
                                          {option.service}
                                        </p>
                                        <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                                          {option.description}
                                        </p>
                                      </div>
                                      {active ? (
                                        <CheckCircle2
                                          size={18}
                                          className="shrink-0 text-orange-500"
                                        />
                                      ) : null}
                                    </div>
                                    <div className="mt-3 flex items-end justify-between gap-3">
                                      <span className="text-xs text-gray-500">
                                        Estimasi {cost?.etd || "-"}
                                      </span>
                                      <span className="text-sm font-bold text-orange-500">
                                        {currency(cost?.value || 0)}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-500">
                        Lengkapi alamat sampai kelurahan/kode pos.
                      </div>
                    )}
                  </div>

                  {shippingError ? (
                    <div className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-500">
                      {shippingError}
                    </div>
                  ) : null}
                </div>
              </section>

              <section className="rounded-lg border border-gray-200 bg-white p-4 lg:p-6">
                <SectionTitle
                  icon={<CreditCard size={18} />}
                  title="Pembayaran"
                  badge="4"
                />

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {paymentMethods.map((method) => {
                    const active = selectedPayment?.id === method.id;
                    const methodFee =
                      method.fee +
                      Math.round(adminFeeBase * ((method.fee_percentage || 0) / 100));

                    return (
                      <button
                        type="button"
                        key={method.id}
                        onClick={() => setSelectedPayment(method)}
                        className={`rounded-lg border p-4 text-left transition ${
                          active
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 bg-white hover:border-orange-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-[#19398A]">
                              {method.name}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              Admin {currency(methodFee)}
                            </p>
                          </div>
                          <span
                            className={`grid h-5 w-5 place-items-center rounded-full border ${
                              active
                                ? "border-orange-500 bg-orange-500"
                                : "border-gray-300"
                            }`}
                          >
                            {active ? (
                              <span className="h-2 w-2 rounded-full bg-white" />
                            ) : null}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {error ? (
                <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-500">
                  {error}
                </div>
              ) : null}
            </form>

            <aside className="order-1 h-fit rounded-lg border border-gray-200 bg-white p-4 lg:sticky lg:top-8 lg:order-2 lg:p-5">
              <div className="flex items-center justify-between gap-4">
                <h1 className="text-lg font-bold text-[#19398A]">Ringkasan</h1>
                <span className="rounded-md bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-600">
                  {cartItems.length} item
                </span>
              </div>

              <div className="mt-4 max-h-[320px] space-y-3 overflow-auto pr-1">
                {cartItems.map((item) => (
                  <div
                    key={`${item.id}-${item.variantName || "default"}`}
                    className="flex gap-3 rounded-lg border border-gray-100 p-3"
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100">
                      <Image
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-semibold leading-5 text-[#19398A]">
                        {item.name}
                      </p>
                      {item.variantName ? (
                        <p className="mt-1 truncate text-xs text-gray-500">
                          {item.variantName}
                        </p>
                      ) : null}
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <span className="text-xs text-gray-400">
                          {item.quantity} x {currency(item.price)}
                        </span>
                        <span className="text-sm font-bold text-orange-500">
                          {currency(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-3 border-t border-dashed border-gray-200 pt-4">
                <SummaryRow label="Subtotal" value={currency(subtotalPrice)} />
                <SummaryRow label="Ongkir" value={currency(selectedShippingCost)} />
                <SummaryRow label="Biaya admin" value={currency(adminFee)} />
                <SummaryRow label="PPN admin" value={currency(adminFeeTax)} />
              </div>

              {selectedCity && selectedShippingOption ? (
                <div className="mt-4 flex gap-2 rounded-lg bg-gray-50 px-3 py-3 text-xs leading-5 text-gray-500">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-orange-500" />
                  <span>
                    {selectedShippingOption.courier_name} {selectedShippingOption.service} ke{" "}
                    {selectedSubDistrict?.subdistrict_name}, {selectedDistrict?.district_name},{" "}
                    {selectedCity.type} {selectedCity.city_name} {selectedSubDistrict?.zip_code}
                  </span>
                </div>
              ) : null}

              <div className="mt-5 border-t border-dashed border-gray-200 pt-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Pembayaran</p>
                    <p className="mt-1 text-sm font-semibold text-[#19398A]">
                      Termasuk ongkir
                    </p>
                  </div>
                  <p className="text-right text-2xl font-bold text-orange-500">
                    {currency(totalPrice)}
                  </p>
                </div>

                <button
                  type="submit"
                  form="checkout-form"
                  disabled={!canSubmit}
                  className="mt-5 flex h-12 w-full items-center justify-center rounded-lg bg-orange-500 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Memproses..." : "Lanjut Pembayaran"}
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

const inputClass =
  "h-12 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-[#19398A] outline-none transition focus:border-orange-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60";

function SectionTitle({
  icon,
  title,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  badge: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-8 w-8 place-items-center rounded-md bg-[#19398A] text-xs font-bold text-white">
        {badge}
      </span>
      <span className="grid h-8 w-8 place-items-center rounded-md bg-orange-50 text-orange-500">
        {icon}
      </span>
      <h2 className="text-base font-bold text-[#19398A]">{title}</h2>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-medium text-[#19398A]">
        {icon ? <span className="text-orange-500">{icon}</span> : null}
        {label}
      </span>
      {children}
    </label>
  );
}

function SmartSelect({
  id,
  value,
  placeholder,
  options,
  open,
  search,
  disabled,
  onOpenChange,
  onSearchChange,
  onChange,
}: {
  id: "province" | "city" | "district" | "subdistrict";
  value: string;
  placeholder: string;
  options: SelectOption[];
  open: boolean;
  search: string;
  disabled?: boolean;
  onOpenChange: (open: boolean) => void;
  onSearchChange: (value: string) => void;
  onChange: (value: string) => void;
}) {
  const selected = options.find((option) => option.value === value);
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onOpenChange(!open)}
        className={`flex h-12 w-full items-center justify-between gap-3 rounded-lg border px-4 text-left text-sm outline-none transition ${
          open
            ? "border-orange-500 bg-white ring-2 ring-orange-100"
            : "border-gray-200 bg-gray-50 hover:border-orange-200"
        } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span
          className={`min-w-0 truncate ${
            selected ? "font-semibold text-[#19398A]" : "text-[#8190bf]"
          }`}
        >
          {selected?.label || placeholder}
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-[#19398A] transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl shadow-slate-200/70">
          <div className="border-b border-gray-100 p-2">
            <div className="flex h-10 items-center gap-2 rounded-md bg-gray-50 px-3 text-sm text-gray-500">
              <Search size={16} className="shrink-0 text-orange-500" />
              <input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                autoFocus
                placeholder={`Cari ${
                  id === "province"
                    ? "provinsi"
                    : id === "city"
                      ? "kota"
                      : id === "district"
                        ? "kecamatan"
                        : "kelurahan"
                }`}
                className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#19398A] outline-none placeholder:text-[#8190bf]"
              />
            </div>
          </div>

          <div className="max-h-72 overflow-auto p-2">
            {filteredOptions.length > 0 ? (
              <div className="divide-y divide-gray-100 overflow-hidden rounded-md border border-gray-100">
                {filteredOptions.map((option) => {
                  const active = option.value === value;

                  return (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => onChange(option.value)}
                      className={`grid min-h-11 w-full grid-cols-[1fr_auto] items-center gap-3 px-3 py-2 text-left text-sm transition ${
                        active
                          ? "bg-orange-50 font-bold text-orange-600"
                          : "bg-white text-[#19398A] hover:bg-gray-50"
                      }`}
                    >
                      <span className="truncate">{option.label}</span>
                      {active ? (
                        <Check size={16} className="text-orange-500" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-500">
                Data tidak ditemukan
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm text-gray-500">
      <span>{label}</span>
      <span className="text-right font-semibold text-[#19398A]">{value}</span>
    </div>
  );
}
