#include <catch2/catch.hpp>
#include "mark_sweep.hpp"

TEST_CASE("mark sweep", "[mark_sweep]") {
    using namespace std;
    using namespace tiny_gc;

    SECTION("mark sweep with single list") {
        vector<int64_t> blocks{
                4, 0, 1, 4,
                8, 0, 0, 0,
                0, 0, 0, 0,
                8, 0, 0, 0,
                0, 0, 0, 0,
                4, 0, 1, 24,
                4, 0, 0, 0,
                4, 0, 1, 24,
                8, 0, 0, 0,
                0, 0, 0, 0};
        vector<uint64_t> roots{0, 12, 20};
        uint64_t freelist = null;
        vector<int64_t> expect{
                4, 0, 1, 4,
                8, 0, 0, 0,
                0, 0, 0, 0,
                8, 0, 0, 0,
                0, 0, 0, 0,
                4, 0, 1, 24,
                4, 0, 0, 0,
                12, null, 1, 24,
                8, 0, 0, 0,
                0, 0, 0, 0};
        mark_sweep(blocks, roots, freelist);
        REQUIRE(blocks == expect);
        REQUIRE(freelist == 28);
        vector<int64_t> expect1{
                4, 0, 1, 4,
                8, 0, 0, 0,
                0, 0, 0, 0,
                8, 0, 0, 0,
                0, 0, 0, 0,
                4, 0, 1, 24,
                4, 0, 0, 0,
                4, 0, 1, 24,
                8, null, 0, 0,
                0, 0, 0, 0};
        const auto res = new_obj(blocks, freelist, 1);
        REQUIRE(res == 28);
        REQUIRE(blocks == expect1);
        REQUIRE(freelist == 32);
        vector<int64_t> expect2{
                4, 0, 1, 4,
                8, 0, 0, 0,
                0, 0, 0, 0,
                8, 0, 0, 0,
                0, 0, 0, 0,
                4, 0, 1, 24,
                4, 0, 0, 0,
                4, 0, 1, 24,
                4, 0, 0, 0,
                4, null, 0, 0};
        REQUIRE(new_obj(blocks, freelist, 1) == 32);
        REQUIRE(blocks == expect2);
        REQUIRE(freelist == 36);
        vector<int64_t> expect3{
                4, 0, 1, 4,
                8, 0, 0, 0,
                0, 0, 0, 0,
                8, 0, 0, 0,
                0, 0, 0, 0,
                4, 0, 1, 24,
                4, 0, 0, 0,
                4, 0, 1, 24,
                4, 0, 0, 0,
                4, 0, 0, 0};
        REQUIRE(new_obj(blocks, freelist, 1) == 36);
        REQUIRE(blocks == expect3);
        REQUIRE(freelist == null);
        try {
            new_obj(blocks, freelist, 4);
            REQUIRE(false);
        }
        catch (exception &e) {
            REQUIRE(true);
        }
    }

    SECTION("mark sweep with multi lists") {
        vector<int64_t> blocks{
                4, 0, 1, 4,
                8, 0, 0, 0,
                0, 0, 0, 0,
                8, 0, 0, 0,
                0, 0, 0, 0,
                4, 0, 1, 28,
                4, 0, 0, 0,
                4, 0, 0, 0,
                8, 0, 0, 0,
                0, 0, 0, 0};
        vector<uint64_t> roots{0, 12, 20};
        vector<uint64_t> freelists = {null, null};
        vector<int64_t> expect{
                4, 0, 1, 4,
                8, 0, 0, 0,
                0, 0, 0, 0,
                8, 0, 0, 0,
                0, 0, 0, 0,
                4, 0, 1, 28,
                4, null, 0, 0,
                4, 0, 0, 0,
                8, null, 0, 0,
                0, 0, 0, 0};
        mark_sweep_multi_lists(blocks, roots, freelists);
        REQUIRE(blocks == expect);
        REQUIRE(freelists == vector<uint64_t>{{24, 32}});
    }
}