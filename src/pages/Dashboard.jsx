
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  Building2,
  IndianRupee,
  MapPin,
  Plus,
  ArrowUpRight,
  ArrowRight,
  TrendingUp,
  Compass,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function Dashboard() {
  // Correct Redux state reference
  const hotels = useSelector(
    (state) => state.hotels?.hotels || []
  );

  const navigate = useNavigate();

  // Calculate average property price
  const averagePrice = hotels.length
    ? Math.round(
        hotels.reduce(
          (total, hotel) => total + (Number(hotel.price) || 0),
          0
        ) / hotels.length
      )
    : 0;

  // Group properties by location
  const locationData = useMemo(() => {
    const grouped = {};

    hotels.forEach((hotel) => {
      const location = hotel.location || "Unknown";

      grouped[location] = (grouped[location] || 0) + 1;
    });

    return Object.entries(grouped).map(([location, count]) => ({
      location,
      properties: count,
    }));
  }, [hotels]);

  // Get five highest-priced properties
  const priceData = useMemo(() => {
    return [...hotels]
      .sort(
        (a, b) =>
          (Number(b.price) || 0) - (Number(a.price) || 0)
      )
      .slice(0, 5)
      .map((hotel) => {
        const title = hotel.title || "Untitled Property";

        return {
          name:
            title.length > 16
              ? title.slice(0, 16) + "..."
              : title,
          price: Number(hotel.price) || 0,
        };
      });
  }, [hotels]);

  // Calculate highest property price
  const highestPrice = hotels.length
    ? Math.max(
        ...hotels.map((hotel) => Number(hotel.price) || 0)
      )
    : 0;

  // Calculate available 360 tours
  const propertiesWithTours = hotels.filter((hotel) =>
    hotel.tourSections?.some((section) => section.panorama)
  ).length;

  // Dashboard statistics
  const stats = [
    {
      label: "Total Properties",
      value: hotels.length,
      icon: Building2,
      note: "Properties in your collection",
    },
    {
      label: "Average Price",
      value: `₹${averagePrice.toLocaleString("en-IN")}`,
      icon: IndianRupee,
      note: "Average price per night",
    },
    {
      label: "Locations",
      value: locationData.length,
      icon: MapPin,
      note: "Unique destinations",
    },
    {
      label: "Highest Price",
      value: `₹${highestPrice.toLocaleString("en-IN")}`,
      icon: TrendingUp,
      note: "Highest listed nightly price",
    },
  ];

  return (
    <div className="dashboard-page">

      {/* Welcome Section */}
      <section className="dashboard-welcome">
        <div>
          <p className="eyebrow">YOUR PROPERTY OVERVIEW</p>

          <h1>Welcome to HAVENLY.</h1>

          <p>
            A beautiful space to manage your hospitality collection.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => navigate("/hotels/new")}
        >
          <Plus size={18} />
          Add New Property
        </button>
      </section>

      {/* Statistics Cards */}
      <section className="dashboard-stats">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              className="dashboard-stat-card"
              key={stat.label}
            >
              <div className="stat-top">
                <span>{stat.label}</span>

                <div className="stat-icon">
                  <Icon size={20} />
                </div>
              </div>

              <h2>{stat.value}</h2>

              <p>{stat.note}</p>
            </div>
          );
        })}
      </section>

      {/* Analytics Heading */}
      <section className="analytics-heading">
        <div>
          <p className="eyebrow">PERFORMANCE INSIGHTS</p>

          <h2>Property Analytics</h2>

          <p>
            Understand your collection through visual reports.
          </p>
        </div>
      </section>

      {/* Analytics Charts */}
      <section className="analytics-grid">

        {/* Properties by Location */}
        <div className="analytics-card">
          <div className="analytics-card-heading">
            <div>
              <h3>Properties by Location</h3>

              <p>Distribution across destinations</p>
            </div>

            <MapPin size={20} />
          </div>

          {locationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={locationData}
                margin={{
                  top: 15,
                  right: 10,
                  left: -15,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#EAE6DE"
                />

                <XAxis
                  dataKey="location"
                  tick={{ fontSize: 11, fill: "#777" }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#777" }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip />

                <Bar
                  dataKey="properties"
                  name="Properties"
                  fill="#B69A72"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="analytics-empty">
              Add properties to see location analytics.
            </div>
          )}
        </div>

        {/* Price Comparison */}
        <div className="analytics-card">
          <div className="analytics-card-heading">
            <div>
              <h3>Price Comparison</h3>

              <p>Top five highest-priced properties</p>
            </div>

            <IndianRupee size={20} />
          </div>

          {priceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={priceData}
                margin={{
                  top: 15,
                  right: 10,
                  left: 5,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#EAE6DE"
                />

                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#777" }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{ fontSize: 11, fill: "#777" }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  formatter={(value) => [
                    `₹${Number(value).toLocaleString("en-IN")}`,
                    "Price per night",
                  ]}
                />

                <Bar
                  dataKey="price"
                  name="Price"
                  fill="#172A2B"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="analytics-empty">
              Add properties to compare prices.
            </div>
          )}
        </div>
      </section>

      {/* Virtual Tour Analytics */}
      <section className="dashboard-tour-analytics">
        <div className="dashboard-tour-icon">
          <Compass size={22} />
        </div>

        <div>
          <p className="eyebrow">VIRTUAL EXPERIENCE</p>

          <h3>360° Tour Availability</h3>

          <p>
            {propertiesWithTours} out of {hotels.length} properties
            have at least one panorama uploaded.
          </p>
        </div>

        <strong>
          {hotels.length
            ? Math.round(
                (propertiesWithTours / hotels.length) * 100
              )
            : 0}
          %
        </strong>
      </section>

      {/* Recent Properties */}
      <section className="dashboard-properties">
        <div className="dashboard-section-heading">
          <div>
            <p className="eyebrow">CURATED COLLECTION</p>

            <h2>Recent Properties</h2>

            <p>Your latest hotel listings at a glance.</p>
          </div>

          <button
            className="text-link-button"
            onClick={() => navigate("/hotels")}
          >
            View All <ArrowUpRight size={17} />
          </button>
        </div>

        {hotels.length > 0 ? (
          <div className="dashboard-hotel-grid">
            {hotels.slice(0, 3).map((hotel) => (
              <article
                className="dashboard-hotel-card"
                key={hotel.id}
              >
                <img
                  src={
                    hotel.image ||
                    "https://placehold.co/600x400?text=HAVENLY"
                  }
                  alt={hotel.title || "Hotel property"}
                />

                <div className="dashboard-hotel-info">
                  <p className="eyebrow">
                    {hotel.location || "Unknown Location"}
                  </p>

                  <h3>{hotel.title || "Untitled Property"}</h3>

                  <div className="dashboard-hotel-footer">
                    <p>
                      ₹{(Number(hotel.price) || 0).toLocaleString("en-IN")}
                      <span> / night</span>
                    </p>

                    <button
                      className="round-arrow"
                      title="View property"
                      onClick={() =>
                        navigate(`/hotels/${hotel.id}`)
                      }
                    >
                      <ArrowRight size={17} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="dashboard-empty">
            <Building2 size={35} />

            <h3>No properties yet</h3>

            <p>Add your first property to get started.</p>

            <button
              className="primary-button"
              onClick={() => navigate("/hotels/new")}
            >
              <Plus size={17} />
              Add Property
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
