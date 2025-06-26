// HomePage.js
import React, { useState, useEffect } from "react";
import { getBooksFilter } from "../services/bookService";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Form,
  Checkbox,
  Divider,
  InputNumber,
  Button,
  Rate,
  Tabs,
  Pagination,
  Spin,
} from "antd";
import { FilterTwoTone, ReloadOutlined } from "@ant-design/icons";

import "../css/HomePage.css";
import { getCategoryOptions } from "../services/categoryService";
import { useSearch } from "../searchContext";

const HomePage = () => {
  const { searchTerm } = useSearch();

  const [books, setBooks] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 999999]);
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [listCategory, setListCategory] = useState([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortQuery, setSortQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categories = await getCategoryOptions();
        setListCategory(categories);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true);

        const priceStr = `${priceRange[0]}-${priceRange[1]}`;
        const res = await getBooksFilter({
          current,
          pageSize,
          mainText: searchTerm,
          sort: sortQuery,
          category: filterCategory,
          price: priceStr,
        });

        setBooks(res.result);
        setTotal(res.meta.total);
      } catch (err) {
        console.error("Failed to fetch books:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [searchTerm, filterCategory, priceRange, sortQuery, current, pageSize]);

  const handleChangeFilter = (_, allValues) => {
    const categoryString = allValues.category?.join(",") || "";
    const from = allValues.range?.from ?? 0;
    const to = allValues.range?.to ?? 999999;

    setFilterCategory(categoryString);
    setPriceRange([from, to]);
    setCurrent(1);
  };

  const items = [
    { key: "", label: "Tất cả", children: <></> },
    { key: "-updatedAt", label: "Sách Mới", children: <></> },
    { key: "price", label: "Giá Thấp Đến Cao", children: <></> },
    { key: "-price", label: "Giá Cao Đến Thấp", children: <></> },
  ];

  return (
    <div style={{ background: "#efefef", padding: "20px 0" }}>
      <Header />
      <div
        className="homepage-container"
        style={{ maxWidth: 1440, margin: "0 auto" }}
      >
        <Row gutter={[20, 20]}>
          <Col md={4} sm={0} xs={0}>
            <div
              style={{
                padding: "35px",
                background: "#fff",
                borderRadius: 5,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>
                  <FilterTwoTone />
                  <span style={{ fontWeight: 500 }}> Bộ lọc tìm kiếm</span>
                </span>
                <ReloadOutlined
                  title="Reset"
                  onClick={() => {
                    form.resetFields();
                    setFilterCategory("");
                    setPriceRange([0, 999999]);
                    setSortQuery("");
                    setCurrent(1);
                  }}
                />
              </div>
              <Divider />
              <Form form={form} onValuesChange={handleChangeFilter}>
                <Form.Item
                  name="category"
                  label="Danh mục sản phẩm"
                  labelCol={{ span: 24 }}
                >
                  <Checkbox.Group>
                    <Row>
                      {listCategory.map((item, index) => (
                        <Col span={24} key={index} style={{ padding: "7px 0" }}>
                          <Checkbox value={item.value}>{item.label}</Checkbox>
                        </Col>
                      ))}
                    </Row>
                  </Checkbox.Group>
                </Form.Item>

                <Divider />
                <Form.Item label="Khoảng giá" labelCol={{ span: 24 }}>
                  <Row gutter={[10, 10]} style={{ width: "100%" }}>
                    <Col xl={11} md={24}>
                      <Form.Item name={["range", "from"]}>
                        <InputNumber
                          min={0}
                          placeholder="đ TỪ"
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Col>
                    <Col xl={2} md={0}>
                      <div> - </div>
                    </Col>
                    <Col xl={11} md={24}>
                      <Form.Item name={["range", "to"]}>
                        <InputNumber
                          min={0}
                          placeholder="đ ĐẾN"
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Button
                    onClick={() => form.submit()}
                    style={{ width: "100%" }}
                    type="primary"
                  >
                    Áp dụng
                  </Button>
                </Form.Item>

                <Divider />
                <Form.Item label="Đánh giá" labelCol={{ span: 24 }}>
                  {[5, 4, 3, 2, 1].map((val) => (
                    <div key={val}>
                      <Rate
                        value={val}
                        disabled
                        style={{ color: "#ffce3d", fontSize: 15 }}
                      />
                      <span className="ant-rate-text">
                        {val < 5 ? "trở lên" : ""}
                      </span>
                    </div>
                  ))}
                </Form.Item>
              </Form>
            </div>
          </Col>

          <Col md={20} xs={24}>
            <Spin spinning={isLoading}>
              <div
                style={{ padding: "20px", background: "#fff", borderRadius: 5 }}
              >
                <Row>
                  <Tabs
                    defaultActiveKey="sort=-sold"
                    items={items}
                    onChange={(value) => setSortQuery(value)}
                    style={{ overflowX: "auto" }}
                  />
                </Row>

                <Row className="customize-row">
                  {books.map((item, index) => (
                    <div
                      onClick={() => navigate(`/detail-book/${item._id}`)}
                      className="column"
                      key={index}
                    >
                      <div className="wrapper">
                        <div className="thumbnail-fixed-ratio">
                          <img
                            src={`http://localhost:9999${item.image}`}
                            alt="thumbnail book"
                            loading="lazy"
                          />
                        </div>
                        <div className="text" title={item.title}>
                          {item.title}
                        </div>
                        <div className="text">
                          <span>Tác giả {item?.author}</span>
                        </div>
                        <div className="price">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(item?.price ?? 0)}
                        </div>
                      </div>
                    </div>
                  ))}
                </Row>

                <div style={{ marginTop: 30 }}></div>
                <Row style={{ display: "flex", justifyContent: "center" }}>
                  <Pagination
                    current={current}
                    total={total}
                    pageSize={pageSize}
                    responsive
                    onChange={(p, s) => {
                      setCurrent(p);
                      setPageSize(s);
                    }}
                  />
                </Row>
              </div>
            </Spin>
          </Col>
        </Row>
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;